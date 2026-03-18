import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { messages, groupMessages } from '@/constants/MockData';

export default function MessagesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'direct' | 'groups'>('direct');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => tab === 'groups' ? router.push('/create-group') : undefined}
        >
          <Ionicons
            name={tab === 'groups' ? 'people-circle-outline' : 'create-outline'}
            size={24}
            color={Theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'direct' && styles.tabActive]}
          onPress={() => setTab('direct')}
        >
          <Ionicons name="chatbubble-outline" size={16} color={tab === 'direct' ? Theme.colors.primary : Theme.colors.textSecondary} />
          <Text style={[styles.tabText, tab === 'direct' && styles.tabTextActive]}>Direct</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'groups' && styles.tabActive]}
          onPress={() => setTab('groups')}
        >
          <Ionicons name="people-outline" size={16} color={tab === 'groups' ? Theme.colors.primary : Theme.colors.textSecondary} />
          <Text style={[styles.tabText, tab === 'groups' && styles.tabTextActive]}>Groups</Text>
        </TouchableOpacity>
      </View>

      {tab === 'direct' ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {messages.map((msg) => (
            <TouchableOpacity
              key={msg.id}
              style={styles.messageCard}
              activeOpacity={0.75}
              onPress={() => router.push({
                pathname: '/chat',
                params: { id: msg.id, name: msg.name, avatar: msg.avatar }
              })}
            >
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: msg.avatar }} style={styles.avatar} />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.messageContent}>
                <View style={styles.messageTopRow}>
                  <Text style={[styles.messageName, msg.unread && styles.unreadName]}>
                    {msg.name}
                  </Text>
                  <Text style={[styles.messageTime, msg.unread && styles.unreadTime]}>{msg.time}</Text>
                </View>
                <Text style={styles.messageUsername}>@{msg.username}</Text>
                <Text
                  style={[styles.messagePreview, msg.unread && styles.unreadPreview]}
                  numberOfLines={1}
                >
                  {msg.lastMessage}
                </Text>
              </View>
              {msg.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.newGroupButton}
            onPress={() => router.push('/create-group')}
            activeOpacity={0.8}
          >
            <View style={styles.newGroupIcon}>
              <Ionicons name="add" size={22} color={Theme.colors.white} />
            </View>
            <Text style={styles.newGroupText}>Create New Group</Text>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>

          {groupMessages.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.messageCard}
              activeOpacity={0.75}
              onPress={() => router.push({
                pathname: '/chat',
                params: { id: group.id, name: group.name, avatar: '', isGroup: 'true' }
              })}
            >
              <View style={styles.groupAvatarStack}>
                {group.members.slice(0, 2).map((av, i) => (
                  <Image
                    key={i}
                    source={{ uri: av }}
                    style={[styles.stackedAvatar, i === 1 && styles.stackedAvatarOffset]}
                  />
                ))}
              </View>
              <View style={styles.messageContent}>
                <View style={styles.messageTopRow}>
                  <Text style={[styles.messageName, group.unread && styles.unreadName]}>
                    {group.name}
                  </Text>
                  <Text style={[styles.messageTime, group.unread && styles.unreadTime]}>{group.time}</Text>
                </View>
                <Text style={styles.messageUsername}>{group.memberCount} members</Text>
                <Text
                  style={[styles.messagePreview, group.unread && styles.unreadPreview]}
                  numberOfLines={1}
                >
                  {group.lastMessage}
                </Text>
              </View>
              {group.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
  composeButton: {
    padding: Theme.spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.textSecondary,
  },
  tabTextActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.fontWeight.bold,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  newGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  newGroupIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGroupText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.textPrimary,
  },
  messageCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: Theme.spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: Theme.colors.white,
  },
  groupAvatarStack: {
    width: 52,
    height: 52,
    marginRight: Theme.spacing.md,
    position: 'relative',
  },
  stackedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: 'absolute',
    borderWidth: 2,
    borderColor: Theme.colors.white,
  },
  stackedAvatarOffset: {
    bottom: 0,
    right: 0,
  },
  messageContent: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  messageName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.textPrimary,
  },
  unreadName: {
    fontWeight: Theme.fontWeight.bold,
  },
  messageUsername: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textMuted,
    marginBottom: 2,
  },
  messageTime: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textMuted,
  },
  unreadTime: {
    color: Theme.colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
  messagePreview: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  unreadPreview: {
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
    marginLeft: Theme.spacing.sm,
  },
});
