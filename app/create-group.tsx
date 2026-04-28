import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { friends as friendsApi, messages as messagesApi, PublicUser } from '@/lib/api';

export default function CreateGroupScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [contacts, setContacts] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    friendsApi.list()
      .then((res) => setContacts(res.friends))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter(c =>
    (c.displayName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (selected.length < 2 || creating) return;
    setCreating(true);
    try {
      const conv = await messagesApi.createGroup(selected, groupName.trim() || undefined);
      router.replace({
        pathname: '/chat',
        params: {
          id: conv.id,
          name: conv.name || 'Group Chat',
          isGroup: '1',
        },
      });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <TouchableOpacity
          style={[styles.createBtn, (selected.length < 2 || creating) && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={selected.length < 2 || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color={Theme.colors.white} />
          ) : (
            <Text style={[styles.createBtnText, selected.length < 2 && styles.createBtnTextDisabled]}>
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.groupNameRow}>
        <View style={styles.groupIconPlaceholder}>
          <Ionicons name="people" size={24} color={Theme.colors.white} />
        </View>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Group name..."
          placeholderTextColor={Theme.colors.textMuted}
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {selected.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedRow}
          contentContainerStyle={styles.selectedRowContent}
        >
          {contacts.filter(c => selected.includes(c.id)).map(c => (
            <TouchableOpacity key={c.id} style={styles.selectedChip} onPress={() => toggle(c.id)}>
              {c.avatarUrl ? (
                <Image source={{ uri: c.avatarUrl }} style={styles.chipAvatar} />
              ) : (
                <View style={[styles.chipAvatar, styles.chipAvatarPlaceholder]}>
                  <Text style={styles.chipAvatarText}>{(c.displayName ?? c.username).charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <Text style={styles.chipName}>{c.username}</Text>
              <Ionicons name="close-circle" size={16} color={Theme.colors.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={Theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={Theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionLabel}>Add Members ({selected.length} selected)</Text>

      {loading ? (
        <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={Theme.colors.textMuted} />
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>Add friends first to create a group chat</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map(contact => {
            const isSelected = selected.includes(contact.id);
            return (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactRow}
                onPress={() => toggle(contact.id)}
                activeOpacity={0.7}
              >
                {contact.avatarUrl ? (
                  <Image source={{ uri: contact.avatarUrl }} style={styles.contactAvatar} />
                ) : (
                  <View style={[styles.contactAvatar, styles.contactAvatarPlaceholder]}>
                    <Ionicons name="person" size={20} color={Theme.colors.textMuted} />
                  </View>
                )}
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.displayName ?? contact.username}</Text>
                  <Text style={styles.contactUsername}>@{contact.username}</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={Theme.colors.white} />}
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
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    backgroundColor: c.white,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  backBtn: { padding: Theme.spacing.sm },
  headerTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: c.textPrimary,
  },
  createBtn: {
    backgroundColor: c.primary,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
  },
  createBtnDisabled: {
    backgroundColor: c.border,
  },
  createBtnText: {
    color: c.white,
    fontWeight: Theme.fontWeight.bold,
    fontSize: Theme.fontSize.sm,
  },
  createBtnTextDisabled: {
    color: c.textMuted,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: c.white,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    gap: Theme.spacing.md,
  },
  groupIconPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupNameInput: {
    flex: 1,
    fontSize: Theme.fontSize.lg,
    color: c.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    paddingBottom: 6,
  },
  selectedRow: {
    backgroundColor: c.white,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    maxHeight: 80,
  },
  selectedRowContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    gap: 8,
    alignItems: 'center',
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: c.primary,
  },
  chipAvatar: { width: 24, height: 24, borderRadius: 12 },
  chipAvatarPlaceholder: { backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  chipAvatarText: { fontSize: 10, fontWeight: Theme.fontWeight.bold, color: c.textSecondary },
  chipName: { fontSize: Theme.fontSize.xs, color: c.primary, fontWeight: Theme.fontWeight.medium },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.white,
    margin: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: c.textPrimary,
  },
  sectionLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    color: c.textSecondary,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: c.white,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  contactAvatar: { width: 46, height: 46, borderRadius: 23, marginRight: Theme.spacing.md },
  contactAvatarPlaceholder: { backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: Theme.spacing.xxl },
  emptyText: { fontSize: Theme.fontSize.md, color: c.textSecondary, marginTop: Theme.spacing.md },
  emptySubtext: { fontSize: Theme.fontSize.sm, color: c.textMuted, marginTop: Theme.spacing.xs },
  contactInfo: { flex: 1 },
  contactName: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: c.textPrimary },
  contactUsername: { fontSize: Theme.fontSize.sm, color: c.textSecondary, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
});
