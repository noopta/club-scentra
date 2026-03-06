import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { profilePhotos } from '@/constants/MockData';
import ProfileHeader from '@/components/ProfileHeader';
import PhotoGrid from '@/components/PhotoGrid';

export default function FriendProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>

        <ProfileHeader
          username="LukeH"
          name="Luke Homes"
          avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
          events={10}
          followers={76}
          following={76}
          car="A91 Supra"
          location="Toronto"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.followButton} activeOpacity={0.8}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => router.push('/messages')}
            activeOpacity={0.8}
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mutualRow}>
          <View style={styles.mutualAvatars}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.mutualAvatar, { marginLeft: i > 1 ? -8 : 0 }]}>
                <Image
                  source={{ uri: `https://images.unsplash.com/photo-150${i}003211169-0a1dd7228f2d?w=100` }}
                  style={styles.mutualAvatarImage}
                />
              </View>
            ))}
          </View>
          <Text style={styles.mutualText}>Followed by Adi10 and 7 others</Text>
        </View>

        <PhotoGrid photos={profilePhotos} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: Theme.spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: Theme.spacing.md,
    zIndex: 10,
    padding: Theme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  followButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.white,
  },
  messageButton: {
    flex: 1.5,
    backgroundColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
  mutualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  mutualAvatars: {
    flexDirection: 'row',
    marginRight: Theme.spacing.sm,
  },
  mutualAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.white,
    overflow: 'hidden',
  },
  mutualAvatarImage: {
    width: '100%',
    height: '100%',
  },
  mutualText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
});
