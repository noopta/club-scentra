import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { social, Post } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import ProfileHeader from '@/components/ProfileHeader';
import PhotoGrid from '@/components/PhotoGrid';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      await refreshUser();
      if (user?.id) {
        const res = await social.getPosts(user.id);
        setPosts(res.posts);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const photoUrls = posts.map(p => p.imageUrl);

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
              events={0}
              followers={0}
              following={0}
              bio={user?.bio ?? ''}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')} activeOpacity={0.8}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
                <Text style={styles.shareButtonText}>Share Profile</Text>
              </TouchableOpacity>
            </View>

            <PhotoGrid photos={photoUrls} />
          </>
        )}
      </ScrollView>

      <Modal visible={postModalVisible} transparent animationType="slide" onRequestClose={() => setPostModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPostModalVisible(false)}>
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
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  topBar: { paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plusButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: Theme.colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  settingsButton: { padding: Theme.spacing.sm },
  scrollContent: { paddingBottom: Theme.spacing.xl },
  buttonRow: { flexDirection: 'row', paddingHorizontal: Theme.spacing.md, gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
  editButton: { flex: 1, backgroundColor: '#2F3137', borderRadius: Theme.borderRadius.sm, paddingVertical: 12, alignItems: 'center' },
  editButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.white },
  shareButton: { flex: 1, backgroundColor: '#2F3137', borderRadius: Theme.borderRadius.sm, paddingVertical: 12, alignItems: 'center' },
  shareButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Theme.colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Theme.colors.border, alignSelf: 'center', marginBottom: Theme.spacing.md },
  modalTitle: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: Theme.colors.textPrimary, marginBottom: Theme.spacing.lg },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  modalIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', marginRight: Theme.spacing.md },
  modalOptionText: { flex: 1 },
  modalOptionTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textPrimary },
  modalOptionSub: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary, marginTop: 2 },
  cancelButton: { marginTop: Theme.spacing.lg, backgroundColor: Theme.colors.background, borderRadius: Theme.borderRadius.xl, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: Theme.colors.textPrimary },
});
