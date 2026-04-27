import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/errorHandler';

export async function updateMe(
  userId: string,
  data: Partial<{
    displayName: string;
    bio: string;
    avatarUrl: string;
    username: string;
  }>
) {
  if (data.username) {
    const taken = await prisma.user.findFirst({
      where: { username: data.username.trim().toLowerCase(), NOT: { id: userId } },
    });
    if (taken) throw new HttpError(409, 'Username already taken');
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.displayName !== undefined && { displayName: data.displayName }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.username !== undefined && { username: data.username.trim().toLowerCase() }),
    },
    include: { settings: true },
  });
  return serializeUserPublic(user);
}

export async function updateSettings(
  userId: string,
  data: Partial<{
    pushNotifications: boolean;
    emailNotifications: boolean;
    darkMode: boolean;
    locationServices: boolean;
    privateProfile: boolean;
    allowFriendRequests: boolean;
    allowDirectMessages: boolean;
    showLocationOnProfile: boolean;
  }>
) {
  await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  return settings!;
}

export async function deleteAccount(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'User not found');
  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}

export async function getPublicProfile(userId: string, viewerId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      _count: {
        select: {
          hostedEvents: true,
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
  if (!user) throw new HttpError(404, 'User not found');

  const isFollowing =
    viewerId && viewerId !== userId
      ? !!(await prisma.follow.findFirst({
          where: { followerId: viewerId, followingId: userId },
        }))
      : false;

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    eventsCount: user._count.hostedEvents,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    postsCount: user._count.posts,
    isFollowing,
    createdAt: user.createdAt.toISOString(),
  };
}

function serializeUserPublic(user: {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  settings: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    darkMode: boolean;
    locationServices: boolean;
    privateProfile: boolean;
    allowFriendRequests: boolean;
    allowDirectMessages: boolean;
    showLocationOnProfile: boolean;
  } | null;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    settings: user.settings ?? {
      pushNotifications: true,
      emailNotifications: false,
      darkMode: false,
      locationServices: true,
      privateProfile: false,
      allowFriendRequests: true,
      allowDirectMessages: true,
      showLocationOnProfile: true,
    },
  };
}

export async function searchUsers(q: string, excludeUserId: string, take = 20) {
  const term = q.trim();
  if (term.length < 1) return [];
  return prisma.user.findMany({
    where: {
      NOT: { id: excludeUserId },
      OR: [
        { username: { contains: term, mode: 'insensitive' } },
        { displayName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ],
    },
    take,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  });
}
