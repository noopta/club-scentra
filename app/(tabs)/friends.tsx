import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { friends as friendsApi, PublicUser } from '@/lib/api';
import SearchBar from '@/components/SearchBar';

export default function FriendsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [friendsList, setFriendsList] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFriends = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await friendsApi.list();
      setFriendsList(res.friends);
    } catch {
      setFriendsList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadFriends(); }, [loadFriends]));

  const filtered = friendsList.filter(f =>
    (f.displayName ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
    f.username.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFriends(true); }} />}
      >
        <Text style={styles.pageTitle}>Friends</Text>

        <SearchBar placeholder="Search friends..." value={searchText} onChangeText={setSearchText} />

        <TouchableOpacity style={styles.messagesButton} onPress={() => router.push('/messages')} activeOpacity={0.8}>
          <Ionicons name="chatbubbles" size={20} color={Theme.colors.primary} />
          <Text style={styles.messagesButtonText}>Messages</Text>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>All Friends</Text>

        {loading ? (
          <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 24 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Theme.colors.textMuted} />
            <Text style={styles.emptyText}>{searchText ? 'No friends match your search' : 'No friends yet'}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingTop: 60, paddingBottom: Theme.spacing.xl },
  pageTitle: { fontSize: Theme.fontSize.xxl, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, marginBottom: Theme.spacing.md },
  messagesButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, marginBottom: Theme.spacing.lg, gap: Theme.spacing.sm, borderWidth: 1, borderColor: Theme.colors.border },
  messagesButtonText: { flex: 1, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: Theme.colors.textPrimary },
  sectionTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, marginBottom: Theme.spacing.sm },
  friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, marginBottom: Theme.spacing.sm, gap: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { backgroundColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  friendInfo: { flex: 1 },
  friendName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textPrimary },
  friendUsername: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary },
  friendBio: { fontSize: Theme.fontSize.sm, color: Theme.colors.textMuted, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: Theme.spacing.xxl },
  emptyText: { fontSize: Theme.fontSize.md, color: Theme.colors.textSecondary, marginTop: Theme.spacing.md },
});
