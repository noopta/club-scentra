import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, ActivityIndicator, RefreshControl, Animated, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { social, users as usersApi, Post, PublicUser } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import ProfileHeader from '@/components/ProfileHeader';
import PhotoGrid from '@/components/PhotoGrid';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  const [stats, setStats] = useState({ eventsCount: 0, followersCount: 0, followingCount: 0 });
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);
  const [followers, setFollowers] = useState<PublicUser[]>([]);
  const [following, setFollowing] = useState<PublicUser[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (postModalVisible) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      overlayOpacity.setValue(0);
    }
  }, [postModalVisible]);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      await refreshUser();
      if (user?.id) {
        const [postsRes, statsRes] = await Promise.all([
          social.getPosts(user.id),
          usersApi.getStats(user.id).catch(() => ({ eventsCount: 0, followersCount: 0, followingCount: 0 })),
        ]);
        setPosts(postsRes.posts);
        setStats(statsRes);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const loadFollowers = useCallback(async () => {
    if (!user?.id) return;
    setLoadingList(true);
    try {
      const res = await usersApi.getFollowers(user.id);
      setFollowers(res.users);
    } catch {
      setFollowers([]);
    } finally {
      setLoadingList(false);
    }
  }, [user?.id]);

  const loadFollowing = useCallback(async () => {
    if (!user?.id) return;
    setLoadingList(true);
    try {
      const res = await usersApi.getFollowing(user.id);
      setFollowing(res.users);
    } catch {
      setFollowing([]);
    } finally {
      setLoadingList(false);
    }
  }, [user?.id]);

  const openFollowersModal = () => {
    setFollowersModalVisible(true);
    loadFollowers();
  };

  const openFollowingModal = () => {
    setFollowingModalVisible(true);
    loadFollowing();
  };

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const profilePosts = posts.filter(p => !p.eventId);
  const photoUrls = profilePosts.map(p => p.imageUrl);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.plusButton} onPress={() => setPostModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(true); }} />}
      >
        {loading ? (
          <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            <ProfileHeader
              username={user?.username ?? ''}
              name={user?.displayName ?? user?.username ?? ''}
              avatar={user?.avatarUrl ?? undefined}
              events={stats.eventsCount}
              followers={stats.followersCount}
              following={stats.followingCount}
              bio={user?.bio ?? ''}
              onFollowersPress={openFollowersModal}
              onFollowingPress={openFollowingModal}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')} activeOpacity={0.8}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
                <Text style={styles.shareButtonText}>Share Profile</Text>
              </TouchableOpacity>
            </View>

            <PhotoGrid photos={photoUrls} posts={profilePosts} />
          </>
        )}
      </ScrollView>

      <Modal visible={postModalVisible} transparent animationType="slide" onRequestClose={() => setPostModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPostModalVisible(false)} />
          </Animated.View>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity
              style={styles.modalOption}
              activeOpacity={0.8}
              onPress={() => {
                setPostModalVisible(false);
                router.push('/create-post');
              }}
            >
              <View style={styles.modalIconWrap}>
                <Ionicons name="image-outline" size={26} color={Theme.colors.primary} />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Post Photo</Text>
                <Text style={styles.modalOptionSub}>Share a photo to your profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              activeOpacity={0.8}
              onPress={() => {
                setPostModalVisible(false);
                router.push('/(tabs)/meets');
              }}
            >
              <View style={styles.modalIconWrap}>
                <Ionicons name="flame-outline" size={26} color={Theme.colors.primary} />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Post to a Meet</Text>
                <Text style={styles.modalOptionSub}>Pick a meet and share a photo from it</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setPostModalVisible(false)} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Followers Modal */}
      <Modal visible={followersModalVisible} transparent animationType="slide" onRequestClose={() => setFollowersModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setFollowersModalVisible(false)} />
          </Animated.View>
          <View style={styles.listModalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Followers</Text>
            {loadingList ? (
              <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 20 }} />
            ) : followers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={Theme.colors.textMuted} />
                <Text style={styles.emptyText}>No followers yet</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {followers.map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={styles.userRow}
                    onPress={() => { setFollowersModalVisible(false); router.push({ pathname: '/friend-profile', params: { id: u.id } }); }}
                    activeOpacity={0.8}
                  >
                    {u.avatarUrl ? (
                      <Image source={{ uri: u.avatarUrl }} style={styles.userAvatar} />
                    ) : (
                      <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                        <Ionicons name="person" size={20} color={Theme.colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.userInfo}>
                      <Text style={styles.userDisplayName}>{u.displayName || u.username}</Text>
                      <Text style={styles.userUsername}>@{u.username}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Theme.colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Following Modal */}
      <Modal visible={followingModalVisible} transparent animationType="slide" onRequestClose={() => setFollowingModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setFollowingModalVisible(false)} />
          </Animated.View>
          <View style={styles.listModalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Following</Text>
            {loadingList ? (
              <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 20 }} />
            ) : following.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={Theme.colors.textMuted} />
                <Text style={styles.emptyText}>Not following anyone yet</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {following.map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={styles.userRow}
                    onPress={() => { setFollowingModalVisible(false); router.push({ pathname: '/friend-profile', params: { id: u.id } }); }}
                    activeOpacity={0.8}
                  >
                    {u.avatarUrl ? (
                      <Image source={{ uri: u.avatarUrl }} style={styles.userAvatar} />
                    ) : (
                      <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                        <Ionicons name="person" size={20} color={Theme.colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.userInfo}>
                      <Text style={styles.userDisplayName}>{u.displayName || u.username}</Text>
                      <Text style={styles.userUsername}>@{u.username}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Theme.colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  topBar: { paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plusButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border },
  settingsButton: { padding: Theme.spacing.sm },
  scrollContent: { paddingBottom: Theme.spacing.xl },
  buttonRow: { flexDirection: 'row', paddingHorizontal: Theme.spacing.md, gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
  editButton: { flex: 1, backgroundColor: '#2F3137', borderRadius: Theme.borderRadius.sm, paddingVertical: 12, alignItems: 'center' },
  editButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.white },
  shareButton: { flex: 1, backgroundColor: '#2F3137', borderRadius: Theme.borderRadius.sm, paddingVertical: 12, alignItems: 'center' },
  shareButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.white },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: Theme.spacing.md },
  modalTitle: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.lg },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: c.border },
  modalIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', marginRight: Theme.spacing.md },
  modalOptionText: { flex: 1 },
  modalOptionTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.textPrimary },
  modalOptionSub: { fontSize: Theme.fontSize.sm, color: c.textSecondary, marginTop: 2 },
  cancelButton: { marginTop: Theme.spacing.lg, backgroundColor: c.background, borderRadius: Theme.borderRadius.xl, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.textPrimary },
  listModalSheet: { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md, paddingBottom: 40, maxHeight: '70%' },
  emptyState: { alignItems: 'center', paddingVertical: Theme.spacing.xxl },
  emptyText: { fontSize: Theme.fontSize.md, color: c.textSecondary, marginTop: Theme.spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: c.border },
  userAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: Theme.spacing.md },
  userAvatarPlaceholder: { backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  userDisplayName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.textPrimary },
  userUsername: { fontSize: Theme.fontSize.sm, color: c.textSecondary, marginTop: 2 },
});
