import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://api.airthreads.ai:4014/api';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, accessToken],
    [REFRESH_KEY, refreshToken],
  ]);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await clearTokens();
      return null;
    }
    const data = await res.json();
    await saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, options, false);
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
};

export type User = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  settings?: UserSettings;
};

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio?: string | null;
  eventsCount?: number;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  createdAt?: string;
};

export type UserSettings = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  locationServices: boolean;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  startAt: string;
  endAt: string | null;
  addressLine: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  host: PublicUser;
  goingCount: number;
  interestedCount: number;
  viewerStatus: 'GOING' | 'INTERESTED' | null;
};

export type Conversation = {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  updatedAt: string;
  participants: { user: PublicUser }[];
  messages: Message[];
};

export type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender?: PublicUser;
};

export type Post = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  authorId: string;
};

export const auth = {
  register: (data: { username: string; email: string; password: string; displayName?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (identifier: string, password: string) =>
    request<AuthResponse>('/auth/login-identifier', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  google: (idToken: string) =>
    request<AuthResponse>('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),

  apple: async (identityToken: string, email: string | null, fullName: string | null): Promise<AuthResponse> => {
    const res = await fetch('https://api.airthreads.ai:4014/api/auth/apple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identityToken, email, fullName }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Apple sign-in failed (${res.status})`);
    }
    return res.json();
  },
};

export const users = {
  me: () => request<User>('/users/me'),

  updateMe: (data: Partial<{ displayName: string; username: string; bio: string; avatarUrl: string }>) =>
    request<PublicUser>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  getSettings: () => request<UserSettings>('/users/me/settings'),

  updateSettings: (data: Partial<UserSettings>) =>
    request<UserSettings>('/users/me/settings', { method: 'PATCH', body: JSON.stringify(data) }),

  getById: (id: string) => request<PublicUser>(`/users/${id}`),

  search: (q: string) => request<PublicUser[]>(`/users/search?q=${encodeURIComponent(q)}`),
};

export const events = {
  explore: (params?: {
    q?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: 'popular' | 'nearest';
    skip?: number;
    take?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.location) query.set('location', params.location);
    if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params?.dateTo) query.set('dateTo', params.dateTo);
    if (params?.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return request<{ events: Event[] }>(`/events/explore${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => request<Event>(`/events/${id}`),

  create: (data: Partial<Event> & { title: string; description: string; startAt: string }) =>
    request<Event>('/events', { method: 'POST', body: JSON.stringify(data) }),

  rsvp: (id: string, status: 'GOING' | 'INTERESTED') =>
    request<Event>(`/events/${id}/rsvp`, { method: 'POST', body: JSON.stringify({ status }) }),

  removeRsvp: (id: string) =>
    request<{ ok: boolean }>(`/events/${id}/rsvp`, { method: 'DELETE' }),
};

export const meets = {
  getSection: (
    section: 'hosting' | 'going' | 'saved' | 'past',
    params?: { q?: string; location?: string; dateFrom?: string; dateTo?: string }
  ) => {
    const query = new URLSearchParams({ section });
    if (params?.q) query.set('q', params.q);
    if (params?.location) query.set('location', params.location);
    const qs = query.toString();
    return request<{ events: Event[] }>(`/me/meets?${qs}`);
  },
};

export const friends = {
  list: () => request<{ friends: PublicUser[] }>('/friends'),

  incomingRequests: () =>
    request<{ requests: { id: string; requester: PublicUser }[] }>('/friends/requests/incoming'),

  sendRequest: (addresseeId: string) =>
    request<unknown>('/friends/requests', { method: 'POST', body: JSON.stringify({ addresseeId }) }),

  acceptRequest: (id: string) =>
    request<unknown>(`/friends/requests/${id}/accept`, { method: 'POST' }),

  declineRequest: (id: string) =>
    request<{ ok: boolean }>(`/friends/requests/${id}`, { method: 'DELETE' }),
};

export const messages = {
  conversations: () => request<{ conversations: Conversation[] }>('/messages/conversations'),

  startDirect: (otherUserId: string) =>
    request<Conversation>('/messages/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ otherUserId }),
    }),

  getMessages: (conversationId: string, cursor?: string) => {
    const qs = cursor ? `?cursor=${cursor}` : '';
    return request<{ messages: Message[] }>(`/messages/conversations/${conversationId}/messages${qs}`);
  },

  sendMessage: (conversationId: string, body: string) =>
    request<Message>(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
};

export const social = {
  follow: (userId: string) =>
    request<{ ok: boolean }>(`/social/follow/${userId}`, { method: 'POST' }),

  unfollow: (userId: string) =>
    request<{ ok: boolean }>(`/social/follow/${userId}`, { method: 'DELETE' }),

  getPosts: (userId: string) =>
    request<{ posts: Post[] }>(`/social/users/${userId}/posts`),

  createPost: (imageUrl: string, caption?: string) =>
    request<Post>('/social/posts', { method: 'POST', body: JSON.stringify({ imageUrl, caption }) }),
};

export const uploads = {
  uploadImage: async (uri: string): Promise<{ url: string; key: string }> => {
    const token = await getAccessToken();
    const formData = new FormData();
    const filename = uri.split('/').pop()?.split('?')[0] ?? 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase().replace('jpg', 'jpeg')}` : 'image/jpeg';

    // On web, ImagePicker returns a blob: or data: URI — fetch it into a real Blob.
    // On native, append the { uri } object which React Native's fetch understands.
    if (uri.startsWith('blob:') || uri.startsWith('data:')) {
      const blob = await fetch(uri).then(r => r.blob());
      formData.append('file', blob, filename);
    } else {
      formData.append('file', { uri, name: filename, type } as unknown as Blob);
    }

    const res = await fetch(`${BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Upload failed');
    }
    return res.json();
  },
};
