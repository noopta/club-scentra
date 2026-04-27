import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { messages as messagesApi, Conversation } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function MessagesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<'direct' | 'groups'>('direct');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await messagesApi.conversations();
      setConversations(res.conversations);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const direct = conversations.filter(c => c.type === 'DIRECT');
  const groups = conversations.filter(c => c.type === 'GROUP');
  const shown = tab === 'direct' ? direct : groups;

  function getDisplayName(conv: Conversation): string {
    if (conv.type === 'GROUP') return conv.name ?? 'Group Chat';
    const other = conv.participants.find(p => p.user.id !== user?.id);
    return other?.user.displayName ?? other?.user.username ?? 'Unknown';
  }

  function getAvatar(conv: Conversation): string | null {
    if (conv.type === 'GROUP') return null;
    const other = conv.participants.find(p => p.user.id !== user?.id);
    return other?.user.avatarUrl ?? null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.composeButton} onPress={() => tab === 'groups' ? router.push('/create-group') : undefined}>
          <Ionicons name={tab === 'groups' ? 'people-circle-outline' : 'create-outline'} size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'direct' && styles.tabActive]} onPress={() => setTab('direct')}>
          <Ionicons name="chatbubble-outline" size={16} color={tab === 'direct' ? Theme.colors.primary : Theme.colors.textSecondary} />
          <Text style={[styles.tabText, tab === 'direct' && styles.tabTextActive]}>Direct</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'groups' && styles.tabActive]} onPress={() => setTab('groups')}>
          <Ionicons name="people-outline" size={16} color={tab === 'groups' ? Theme.colors.primary : Theme.colors.textSecondary} />
          <Text style={[styles.tabText, tab === 'groups' && styles.tabTextActive]}>Groups</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        >
          {shown.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>No {tab === 'direct' ? 'direct messages' : 'group chats'} yet</Text>
            </View>
          ) : shown.map((conv) => {
            const name = getDisplayName(conv);
            const avatar = getAvatar(conv);
            const lastMsg = conv.messages[0];
            return (
              <TouchableOpacity
                key={conv.id}
                style={styles.messageCard}
                activeOpacity={0.75}
                onPress={() => router.push({
                  pathname: '/chat',
                  params: { id: conv.id, name, isGroup: conv.type === 'GROUP' ? '1' : '0' }
                })}
              >
                <View style={styles.avatarWrapper}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name={conv.type === 'GROUP' ? 'people' : 'person'} size={22} color={Theme.colors.textMuted} />
                    </View>
                  )}
                </View>
                <View style={styles.messageInfo}>
                  <View style={styles.messageTop}>
                    <Text style={styles.messageName} numberOfLines={1}>{name}</Text>
                    {lastMsg && <Text style={styles.messageTime}>{timeAgo(lastMsg.createdAt)}</Text>}
                  </View>
                  {lastMsg && <Text style={styles.messagePreview} numberOfLines={1}>{lastMsg.body}</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md, backgroundColor: c.white, borderBottomWidth: 1, borderBottomColor: c.border },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  composeButton: { padding: Theme.spacing.sm },
  tabRow: { flexDirection: 'row', backgroundColor: c.white, borderBottomWidth: 1, borderBottomColor: c.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: c.primary },
  tabText: { fontSize: Theme.fontSize.md, color: c.textSecondary, fontWeight: Theme.fontWeight.medium },
  tabTextActive: { color: c.primary },
  scrollContent: { paddingVertical: Theme.spacing.sm },
  messageCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.white },
  avatarWrapper: { marginRight: Theme.spacing.md },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  messageInfo: { flex: 1 },
  messageTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  messageName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.textPrimary, flex: 1 },
  messageTime: { fontSize: Theme.fontSize.xs, color: c.textMuted, marginLeft: 8 },
  messagePreview: { fontSize: Theme.fontSize.sm, color: c.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: Theme.fontSize.md, color: c.textSecondary, marginTop: Theme.spacing.md },
});
