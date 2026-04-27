import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

const CONTACTS = [
  { id: '1', username: 'LukeH', name: 'Luke Homes', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: '2', username: 'MaxDrift99', name: 'Max Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  { id: '3', username: 'TurboTina', name: 'Tina Park', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: '4', username: 'Adi10', name: 'Adi Rahman', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
  { id: '5', username: 'JDMQueen', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  { id: '6', username: 'V8_Victor', name: 'Victor Santos', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
];

export default function CreateGroupScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <TouchableOpacity
          style={[styles.createBtn, selected.length < 2 && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={selected.length < 2}
        >
          <Text style={[styles.createBtnText, selected.length < 2 && styles.createBtnTextDisabled]}>
            Create
          </Text>
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
          {CONTACTS.filter(c => selected.includes(c.id)).map(c => (
            <TouchableOpacity key={c.id} style={styles.selectedChip} onPress={() => toggle(c.id)}>
              <Image source={{ uri: c.avatar }} style={styles.chipAvatar} />
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
              <Image source={{ uri: contact.avatar }} style={styles.contactAvatar} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactUsername}>@{contact.username}</Text>
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Ionicons name="checkmark" size={16} color={Theme.colors.white} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
