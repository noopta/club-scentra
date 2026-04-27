import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

interface ProfileHeaderProps {
  username: string;
  name: string;
  avatar: string;
  events: number;
  followers: number;
  following: number;
  bio?: string;
  car?: string;
  location?: string;
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
}: ProfileHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.username}>@{username}</Text>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{events}</Text>
          <Text style={styles.statLabel}>events</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{followers}</Text>
          <Text style={styles.statLabel}>followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{following}</Text>
          <Text style={styles.statLabel}>following</Text>
        </View>
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
