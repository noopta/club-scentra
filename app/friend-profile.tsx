import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { users, social, PublicUser, Post } from '@/lib/api';
import ProfileHeader from '@/components/ProfileHeader';
import PhotoGrid from '@/components/PhotoGrid';
import { messages as messagesApi } from '@/lib/api';

export default function FriendProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      users.getById(id),
      social.getPosts(id),
    ]).then(([user, postsRes]) => {
      setProfile(user);
      setFollowing(user.isFollowing ?? false);
      setPosts(postsRes.posts);
    }).catch(() => {
      Alert.alert('Error', 'Could not load profile');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (following) {
        await social.unfollow(profile.id);
        setFollowing(false);
      } else {
        await social.follow(profile.id);
        setFollowing(true);
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!profile || messageLoading) return;
    setMessageLoading(true);
    try {
      const conv = await messagesApi.startDirect(profile.id);
      router.push({
        pathname: '/chat',
        params: {
          id: conv.id,
          name: profile.displayName ?? profile.username,
          isGroup: '0',
        },
      });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not open conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Theme.colors.textSecondary }}>Profile not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photoUrls = posts.map(p => p.imageUrl);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          username={profile.username}
          name={profile.displayName ?? profile.username}
          avatar={profile.avatarUrl ?? undefined}
          events={profile.eventsCount ?? 0}
          followers={profile.followersCount ?? 0}
          following={profile.followingCount ?? 0}
          bio={profile.bio ?? ''}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.followButton, following && styles.followingButton]}
            onPress={handleFollow}
            activeOpacity={0.8}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color={Theme.colors.white} />
            ) : (
              <Text style={styles.followButtonText}>{following ? 'Following' : 'Follow'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessage}
            activeOpacity={0.8}
            disabled={messageLoading}
          >
            {messageLoading ? (
              <ActivityIndicator size="small" color={Theme.colors.white} />
            ) : (
              <Text style={styles.messageButtonText}>Message</Text>
            )}
          </TouchableOpacity>
        </View>

        <PhotoGrid photos={photoUrls} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  topBar: { paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.sm },
  backButton: { padding: Theme.spacing.sm, alignSelf: 'flex-start' },
  scrollContent: { paddingBottom: Theme.spacing.xl },
  buttonRow: { flexDirection: 'row', paddingHorizontal: Theme.spacing.md, gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
  followButton: { flex: 1, backgroundColor: c.primary, borderRadius: Theme.borderRadius.sm, paddingVertical: 12, alignItems: 'center' },
  followingButton: { backgroundColor: '#2F3137' },
  followButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.white },
  messageButton: { flex: 1, backgroundColor: '#2F3137', borderRadius: Theme.borderRadius.sm, paddingVertical: 12, alignItems: 'center' },
  messageButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.white },
});
