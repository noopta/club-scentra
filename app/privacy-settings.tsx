import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';

type Audience = 'everyone' | 'friends_of_friends' | 'no_one';

type PrivacyPrefs = {
  privateProfile: boolean;
  showActivity: boolean;
  allowFriendRequests: Audience;
  allowMessages: Audience;
};

const DEFAULT_PREFS: PrivacyPrefs = {
  privateProfile: false,
  showActivity: true,
  allowFriendRequests: 'everyone',
  allowMessages: 'everyone',
};

const STORAGE_KEY = 'privacyPrefs';

const AUDIENCES: { value: Audience; label: string; description: string }[] = [
  { value: 'everyone', label: 'Everyone', description: 'Anyone using Club Scentra' },
  { value: 'friends_of_friends', label: 'Friends of friends', description: 'People who share a friend with you' },
  { value: 'no_one', label: 'No one', description: 'Only you can take this action' },
];

export default function PrivacySettingsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<PrivacyPrefs>(DEFAULT_PREFS);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PrivacyPrefs>;
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (next: PrivacyPrefs, key: string) => {
    setSavingKey(key);
    setError(null);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save change.');
    } finally {
      setSavingKey(null);
    }
  };

  const update = (patch: Partial<PrivacyPrefs>, key: string) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    persist(next, key);
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

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Profile visibility</Text>
          <View style={styles.card}>
            <ToggleRow
              colors={colors}
              label="Private profile"
              description="Only friends can see your posts, events, and saved meets."
              value={prefs.privateProfile}
              onChange={(v) => update({ privateProfile: v }, 'privateProfile')}
              saving={savingKey === 'privateProfile'}
              isLast={false}
            />
            <ToggleRow
              colors={colors}
              label="Show activity status"
              description="Friends can see when you were last active."
              value={prefs.showActivity}
              onChange={(v) => update({ showActivity: v }, 'showActivity')}
              saving={savingKey === 'showActivity'}
              isLast
            />
          </View>

          <Text style={styles.sectionTitle}>Who can send friend requests</Text>
          <View style={styles.card}>
            {AUDIENCES.map((opt, idx) => (
              <ChoiceRow
                key={opt.value}
                colors={colors}
                label={opt.label}
                description={opt.description}
                selected={prefs.allowFriendRequests === opt.value}
                onPress={() => update({ allowFriendRequests: opt.value }, 'allowFriendRequests')}
                isLast={idx === AUDIENCES.length - 1}
                saving={savingKey === 'allowFriendRequests' && prefs.allowFriendRequests === opt.value}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Who can message you</Text>
          <View style={styles.card}>
            {AUDIENCES.map((opt, idx) => (
              <ChoiceRow
                key={opt.value}
                colors={colors}
                label={opt.label}
                description={opt.description}
                selected={prefs.allowMessages === opt.value}
                onPress={() => update({ allowMessages: opt.value }, 'allowMessages')}
                isLast={idx === AUDIENCES.length - 1}
                saving={savingKey === 'allowMessages' && prefs.allowMessages === opt.value}
              />
            ))}
          </View>

          <Text style={styles.note}>
            Your privacy preferences are saved on this device and applied across the app.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

function ToggleRow({
  colors, label, description, value, onChange, saving, isLast,
}: {
  colors: typeof Theme.colors;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  saving: boolean;
  isLast: boolean;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      {saving ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
      )}
    </View>
  );
}

function ChoiceRow({
  colors, label, description, selected, onPress, isLast, saving,
}: {
  colors: typeof Theme.colors;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  isLast: boolean;
  saving: boolean;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      {saving ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : selected ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      ) : (
        <View style={styles.radioOuter} />
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  sectionTitle: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.bold, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.md },
  card: { backgroundColor: c.cardBackground, borderRadius: Theme.borderRadius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: c.divider },
  rowLast: { borderBottomWidth: 0 },
  rowText: { flex: 1, paddingRight: 12 },
  rowLabel: { color: c.textPrimary, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold },
  rowDescription: { color: c.textSecondary, fontSize: Theme.fontSize.sm, marginTop: 2, lineHeight: 18 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: c.border },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Theme.spacing.sm, marginBottom: Theme.spacing.sm },
  errorText: { color: c.danger, fontSize: Theme.fontSize.sm, flex: 1 },
  note: { fontSize: Theme.fontSize.xs, color: c.textMuted, lineHeight: 16, marginTop: Theme.spacing.lg, textAlign: 'center' },
});
