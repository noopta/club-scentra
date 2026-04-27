import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';

const SUPPORT_EMAIL = 'support@clubscentra.app';

type Category = 'bug' | 'inappropriate' | 'account' | 'other';

const CATEGORIES: { value: Category; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'bug', label: 'Something is broken', icon: 'bug' },
  { value: 'inappropriate', label: 'Inappropriate content', icon: 'flag' },
  { value: 'account', label: 'Account issue', icon: 'person-circle' },
  { value: 'other', label: 'Something else', icon: 'help-circle' },
];

export default function ReportProblemScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const { user } = useAuth();

  const [category, setCategory] = useState<Category>('bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      setError('Please describe the issue with at least 10 characters so we can help.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const cat = CATEGORIES.find(c => c.value === category);
    const subject = `[${cat?.label ?? 'Report'}] Club Scentra problem report`;
    const platform = `${Platform.OS} ${Platform.Version}`;
    const body = [
      `Reporter: ${user?.username ?? 'unknown'} (${user?.id ?? 'no id'})`,
      `Email: ${user?.email ?? 'unknown'}`,
      `Category: ${cat?.label ?? category}`,
      `Platform: ${platform}`,
      `App version: 1.0.0`,
      '',
      'Description:',
      description.trim(),
    ].join('\n');

    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        const successMsg = 'Thanks — your email client is now open with the details prefilled. Send the email to complete your report.';
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') window.alert(successMsg);
        } else {
          Alert.alert('Almost there', successMsg);
        }
        router.back();
      } else {
        setError(`Email isn't available on this device. Please email ${SUPPORT_EMAIL} directly.`);
      }
    } catch {
      setError(`Couldn't open your email app. Please email ${SUPPORT_EMAIL} directly.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report a Problem</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Help us make Club Scentra better. Tell us what went wrong and we&apos;ll look into it.</Text>

        <Text style={styles.sectionTitle}>What kind of problem?</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => {
            const selected = c.value === category;
            return (
              <TouchableOpacity
                key={c.value}
                style={[styles.categoryCard, selected && styles.categoryCardSelected]}
                onPress={() => setCategory(c.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={c.icon}
                  size={22}
                  color={selected ? colors.white : colors.textPrimary}
                />
                <Text style={[styles.categoryLabel, selected && { color: colors.white }]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Describe the problem</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="What happened? Steps to reproduce, what you expected, screenshots…"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {submitting ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        ) : (
          <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={handleSubmit}>
            <Text style={styles.submitText}>Send Report</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.note}>
          Submitting opens your email app with the details prefilled. We typically reply within one business day.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md },
  backButton: { padding: Theme.spacing.sm },
  headerTitle: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  intro: { color: c.textSecondary, fontSize: Theme.fontSize.sm, lineHeight: 20, marginBottom: Theme.spacing.md },
  sectionTitle: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.bold, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: c.cardBackground,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  categoryCardSelected: { backgroundColor: c.primary, borderColor: c.primary },
  categoryLabel: { color: c.textPrimary, fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.semibold, flex: 1 },
  textArea: {
    backgroundColor: c.cardBackground,
    color: c.textPrimary,
    minHeight: 140,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: Theme.fontSize.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  submitBtn: { backgroundColor: c.primary, paddingVertical: 14, borderRadius: Theme.borderRadius.lg, alignItems: 'center', marginTop: Theme.spacing.lg },
  submitText: { color: c.white, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  errorText: { color: c.danger, fontSize: Theme.fontSize.sm, flex: 1 },
  note: { color: c.textMuted, fontSize: Theme.fontSize.xs, textAlign: 'center', marginTop: Theme.spacing.lg, lineHeight: 16 },
});
