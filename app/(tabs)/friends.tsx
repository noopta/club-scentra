import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { friendsList } from '@/constants/MockData';
import SearchBar from '@/components/SearchBar';

export default function FriendsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const filteredFriends = friendsList.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchText.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Friends</Text>

        <SearchBar
          placeholder="Search friends..."
          value={searchText}
          onChangeText={setSearchText}
        />

        <TouchableOpacity
          style={styles.messagesButton}
          onPress={() => router.push('/messages')}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={20} color={Theme.colors.primary} />
          <Text style={styles.messagesButtonText}>Messages</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>All Friends</Text>

        {filteredFriends.map((friend) => (
          <TouchableOpacity
            key={friend.id}
            style={styles.friendCard}
            onPress={() => router.push('/friend-profile')}
            activeOpacity={0.8}
          >
            <Image source={{ uri: friend.avatar }} style={styles.avatar} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendUsername}>@{friend.username}</Text>
              <Text style={styles.friendDetails}>
                🏎️ {friend.car} · 📍 {friend.location}
              </Text>
            </View>
            <View style={styles.friendMeta}>
              <Text style={styles.followersText}>{friend.followers}</Text>
              <Text style={styles.followersLabel}>followers</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 60,
    paddingBottom: Theme.spacing.xl,
  },
  pageTitle: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  messagesButton: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  messagesButtonText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
  badge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.xs,
  },
  badgeText: {
    color: Theme.colors.white,
    fontSize: 11,
    fontWeight: Theme.fontWeight.bold,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  friendCard: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Theme.spacing.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textPrimary,
  },
  friendUsername: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  friendDetails: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  friendMeta: {
    alignItems: 'center',
  },
  followersText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
  followersLabel: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
});
