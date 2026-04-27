import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { users, UserSettings } from '@/lib/api';

type PrivacyKey = 'privateProfile' | 'allowFriendRequests' | 'allowDirectMessages' | 'showLocationOnProfile';

const ROWS: { key: PrivacyKey; icon: keyof typeof Ionicons.glyphMap; label: string; description: string }[] = [
  {
    key: 'privateProfile',
    icon: 'lock-closed-outline',
    label: 'Private Profile',
    description: 'Only friends can see your posts, meets, and full profile.',
  },
  {
    key: 'allowFriendRequests',
    icon: 'person-add-outline',
    label: 'Allow Friend Requests',
    description: 'Let other members send you friend requests.',
  },
  {
    key: 'allowDirectMessages',
    icon: 'chatbubble-ellipses-outline',
    label: 'Allow Direct Messages',
    description: 'Let people who aren\u2019t your friends start a conversation.',
  },
  {
    key: 'showLocationOnProfile',
    icon: 'location-outline',
    label: 'Show Location on Profile',
    description: 'Display your city or region on your public profile.',
  },
];

export default function PrivacySettingsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<PrivacyKey | null>(null);
  const [savedKey, setSavedKey] = useState<PrivacyKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    users.getSettings()
      .then(s => setSettings(s))
      .catch(() => setError('Couldn\u2019t load your privacy settings.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  const updateSetting = async (key: PrivacyKey, value: boolean) => {
    if (!settings) return;
    setError(null);
    const previous = settings[key];
    setSettings({ ...settings, [key]: value });
    setSavingKey(key);
    try {
      await users.updateSettings({ [key]: value });
      setSavingKey(null);
      setSavedKey(key);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSavedKey(null), 1800);
    } catch (err: unknown) {
      setSettings({ ...settings, [key]: previous });
      setSavingKey(null);
      setError(err instanceof Error ? err.message : 'Couldn\u2019t save that change.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={styles.headerSpacer} />
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: Theme.spacing.xl }} />
        ) : (
          <>
            <Text style={styles.intro}>
              Choose who can see your activity and contact you on Club Scentra.
            </Text>

            <View style={styles.sectionCard}>
              {ROWS.map((row, idx) => {
                const value = settings ? settings[row.key] : false;
                const isSaving = savingKey === row.key;
                const isSaved = savedKey === row.key;
                return (
                  <View
                    key={row.key}
                    style={[styles.row, idx === ROWS.length - 1 && styles.rowLast]}
                  >
                    <Ionicons name={row.icon} size={22} color={colors.textPrimary} style={styles.rowIcon} />
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{row.label}</Text>
                      <Text style={styles.rowDescription}>{row.description}</Text>
                    </View>
                    <View style={styles.rowRight}>
                      {isSaving ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                      ) : isSaved ? (
                        <View style={styles.savedPill}>
                          <Ionicons name="checkmark" size={12} color={colors.white} />
                          <Text style={styles.savedText}>Saved</Text>
                        </View>
                      ) : null}
                      <Switch
                        value={!!value}
                        onValueChange={(v) => updateSetting(row.key, v)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.white}
                        disabled={!settings}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={styles.footer}>
              Privacy changes apply right away. To completely remove your data, use Delete Account in Settings.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  intro: { fontSize: Theme.fontSize.sm, color: c.textSecondary, marginBottom: Theme.spacing.md, lineHeight: 20 },
  sectionCard: {
    backgroundColor: c.cardBackground,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { marginTop: 2 },
  rowText: { flex: 1, marginLeft: Theme.spacing.md },
  rowLabel: { fontSize: Theme.fontSize.md, color: c.textPrimary, fontWeight: Theme.fontWeight.medium },
  rowDescription: { fontSize: Theme.fontSize.sm, color: c.textSecondary, marginTop: 2, lineHeight: 18 },
  rowRight: { flexDirection: 'row', alignItems: 'center', marginLeft: Theme.spacing.sm },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: c.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 8,
  },
  savedText: { color: c.white, fontSize: 11, fontWeight: Theme.fontWeight.semibold },
  footer: { fontSize: Theme.fontSize.sm, color: c.textMuted, marginTop: Theme.spacing.sm, lineHeight: 18 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    backgroundColor: c.cardBackground,
    borderColor: c.border,
  },
  errorText: { flex: 1, fontSize: Theme.fontSize.sm, color: c.textPrimary },
});
