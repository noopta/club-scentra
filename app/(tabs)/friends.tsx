import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { friends as friendsApi, users as usersApi, PublicUser } from '@/lib/api';
import SearchBar from '@/components/SearchBar';

export default function FriendsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [friendsList, setFriendsList] = useState<PublicUser[]>([]);
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ id: string; requester: PublicUser }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const loadFriends = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        friendsApi.list(),
        friendsApi.incomingRequests(),
      ]);
      setFriendsList(friendsRes.friends);
      setPendingRequests(requestsRes.requests);
    } catch {
      setFriendsList([]);
      setPendingRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadFriends(); }, [loadFriends]));

  useEffect(() => {
    if (!searchText.trim() || searchText.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await usersApi.search(searchText);
        const friendIds = new Set(friendsList.map(f => f.id));
        setSearchResults(results.filter(u => !friendIds.has(u.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText, friendsList]);

  const filtered = friendsList.filter(f =>
    (f.displayName ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
    f.username.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSendRequest = async (userId: string) => {
    setSendingRequest(userId);
    try {
      await friendsApi.sendRequest(userId);
      Alert.alert('Success', 'Friend request sent!');
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not send friend request');
    } finally {
      setSendingRequest(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsApi.acceptRequest(requestId);
      loadFriends(true);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not accept request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await friendsApi.declineRequest(requestId);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not decline request');
    }
  };

  const isSearching = searchText.trim().length >= 2;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFriends(true); }} />}
      >
        <Text style={styles.pageTitle}>Friends</Text>

        <SearchBar placeholder="Search users or friends..." value={searchText} onChangeText={setSearchText} />

        <TouchableOpacity style={styles.messagesButton} onPress={() => router.push('/messages')} activeOpacity={0.8}>
          <Ionicons name="chatbubbles" size={20} color={Theme.colors.primary} />
          <Text style={styles.messagesButtonText}>Messages</Text>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </TouchableOpacity>

        {pendingRequests.length > 0 && !isSearching && (
          <>
            <Text style={styles.sectionTitle}>Friend Requests ({pendingRequests.length})</Text>
            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.friendCard}>
                <TouchableOpacity
                  style={styles.requestUserRow}
                  onPress={() => router.push({ pathname: '/friend-profile', params: { id: req.requester.id } })}
                  activeOpacity={0.8}
                >
                  {req.requester.avatarUrl ? (
                    <Image source={{ uri: req.requester.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={24} color={Theme.colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{req.requester.displayName ?? req.requester.username}</Text>
                    <Text style={styles.friendUsername}>@{req.requester.username}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptRequest(req.id)}>
                    <Ionicons name="checkmark" size={18} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => handleDeclineRequest(req.id)}>
                    <Ionicons name="close" size={18} color={Theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {isSearching && searchResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searching ? (
              <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 12 }} />
            ) : (
              searchResults.map((user) => (
                <View key={user.id} style={styles.friendCard}>
                  <TouchableOpacity
                    style={styles.requestUserRow}
                    onPress={() => router.push({ pathname: '/friend-profile', params: { id: user.id } })}
                    activeOpacity={0.8}
                  >
                    {user.avatarUrl ? (
                      <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={24} color={Theme.colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{user.displayName ?? user.username}</Text>
                      <Text style={styles.friendUsername}>@{user.username}</Text>
                      {user.bio ? <Text style={styles.friendBio} numberOfLines={1}>{user.bio}</Text> : null}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addFriendBtn}
                    onPress={() => handleSendRequest(user.id)}
                    disabled={sendingRequest === user.id}
                  >
                    {sendingRequest === user.id ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons name="person-add" size={18} color="#FFF" />
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        <Text style={styles.sectionTitle}>All Friends</Text>

        {loading ? (
          <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 24 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Theme.colors.textMuted} />
            <Text style={styles.emptyText}>{searchText ? 'No friends match your search' : 'No friends yet'}</Text>
            {!searchText && <Text style={styles.emptySubtext}>Search for users above to add friends</Text>}
          </View>
        ) : (
          filtered.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={styles.friendCard}
              onPress={() => router.push({ pathname: '/friend-profile', params: { id: friend.id } })}
              activeOpacity={0.8}
            >
              {friend.avatarUrl ? (
                <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={24} color={Theme.colors.textMuted} />
                </View>
              )}
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.displayName ?? friend.username}</Text>
                <Text style={styles.friendUsername}>@{friend.username}</Text>
                {friend.bio ? <Text style={styles.friendBio} numberOfLines={1}>{friend.bio}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingTop: 60, paddingBottom: Theme.spacing.xl },
  pageTitle: { fontSize: Theme.fontSize.xxl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.md },
  messagesButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, marginBottom: Theme.spacing.lg, gap: Theme.spacing.sm, borderWidth: 1, borderColor: c.border },
  messagesButtonText: { flex: 1, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: c.textPrimary },
  sectionTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, marginBottom: Theme.spacing.sm, gap: Theme.spacing.md, borderWidth: 1, borderColor: c.border },
  requestUserRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Theme.spacing.md },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  friendInfo: { flex: 1 },
  friendName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.textPrimary },
  friendUsername: { fontSize: Theme.fontSize.sm, color: c.textSecondary },
  friendBio: { fontSize: Theme.fontSize.sm, color: c.textMuted, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  declineBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  addFriendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: Theme.spacing.xxl },
  emptyText: { fontSize: Theme.fontSize.md, color: c.textSecondary, marginTop: Theme.spacing.md },
  emptySubtext: { fontSize: Theme.fontSize.sm, color: c.textMuted, marginTop: Theme.spacing.xs },
});
