import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ProfileHeaderProps {
  username: string;
  name: string;
  avatar?: string;
  events: number;
  followers: number;
  following: number;
  bio?: string;
  car?: string;
  location?: string;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  onAvatarPress?: () => void;
}

export default function ProfileHeader({
  username,
  name,
  avatar,
  events,
  followers,
  following,
  bio,
  car,
  location,
  onFollowersPress,
  onFollowingPress,
  onAvatarPress,
}: ProfileHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.username}>@{username}</Text>
      <TouchableOpacity style={styles.avatarContainer} onPress={onAvatarPress} activeOpacity={onAvatarPress ? 0.8 : 1}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={48} color={colors.textMuted} />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{events}</Text>
          <Text style={styles.statLabel}>events</Text>
        </View>
        <TouchableOpacity style={styles.statItem} onPress={onFollowersPress} activeOpacity={onFollowersPress ? 0.7 : 1}>
          <Text style={styles.statNumber}>{followers}</Text>
          <Text style={styles.statLabel}>followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={onFollowingPress} activeOpacity={onFollowingPress ? 0.7 : 1}>
          <Text style={styles.statNumber}>{following}</Text>
          <Text style={styles.statLabel}>following</Text>
        </TouchableOpacity>
      </View>
      {car && (
        <Text style={styles.infoText}>🏎️ {car}</Text>
      )}
      {location && (
        <Text style={styles.infoText}>📍 {location}</Text>
      )}
      {bio && (
        <Text style={styles.bio}>{bio}</Text>
      )}
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  username: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: c.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 3,
    borderColor: c.primary,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: c.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: Theme.spacing.lg,
  },
  statNumber: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: c.textPrimary,
  },
  statLabel: {
    fontSize: Theme.fontSize.sm,
    color: c.textSecondary,
  },
  infoText: {
    fontSize: Theme.fontSize.sm,
    color: c.textPrimary,
    marginTop: 2,
  },
  bio: {
    fontSize: Theme.fontSize.sm,
    color: c.textPrimary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
});
