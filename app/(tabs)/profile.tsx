import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { profilePhotos } from '@/constants/MockData';
import ProfileHeader from '@/components/ProfileHeader';
import PhotoGrid from '@/components/PhotoGrid';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          username="Saraaa13"
          name="Sara Nova"
          avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
          events={42}
          followers={258}
          following={258}
          bio="Just a girl and her car 🏎️"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.8}
          >
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
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
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    alignItems: 'flex-end',
  },
  settingsButton: {
    padding: Theme.spacing.sm,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  editButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Theme.colors.textPrimary,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
  shareButton: {
    flex: 1,
    backgroundColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
});
