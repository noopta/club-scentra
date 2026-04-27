import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Linking, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import RedButton from '@/components/RedButton';
import { useAuth } from '@/lib/AuthContext';

const SUPPORT_EMAIL = 'support@clubscentra.com';

type CategoryId = 'bug' | 'account' | 'safety' | 'content' | 'other';

const CATEGORIES: { id: CategoryId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'bug', label: 'Bug or crash', icon: 'bug' },
  { id: 'account', label: 'Account or sign-in', icon: 'person-circle' },
  { id: 'safety', label: 'Safety or harassment', icon: 'shield' },
  { id: 'content', label: 'Inappropriate content', icon: 'flag' },
  { id: 'other', label: 'Something else', icon: 'help-circle' },
];

export default function ReportProblemScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const { user } = useAuth();

  const [category, setCategory] = useState<CategoryId>('bug');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (description.trim().length < 10) {
      const msg = 'Please describe the problem in a few more words (at least 10 characters).';
      setError(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Add a few more details', msg);
      }
      return;
    }
    setError(null);
    setSending(true);
    try {
      const cat = CATEGORIES.find(c => c.id === category);
      const subject = encodeURIComponent(`Club Scentra report: ${cat?.label ?? 'Other'}`);
      const bodyLines = [
        `Category: ${cat?.label ?? category}`,
        user?.email ? `Account email: ${user.email}` : null,
        user?.username ? `Username: @${user.username}` : null,
        `Platform: ${Platform.OS} ${Platform.Version}`,
        `App version: 1.0.0`,
        '',
        'Description:',
        description.trim(),
      ].filter(Boolean) as string[];
      const body = encodeURIComponent(bodyLines.join('\n'));
      const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

      const opened = await Linking.openURL(url).then(() => true).catch(() => false);
      if (!opened && Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = url;
      }

      const done = () => router.back();
      if (Platform.OS === 'web') {
        done();
      } else {
        Alert.alert(
          'Thanks for the report',
          `We${"\u2019"}ve drafted an email to ${SUPPORT_EMAIL} with your report. Please tap Send in your mail app to deliver it.`,
          [{ text: 'OK', onPress: done }]
        );
      }
    } finally {
      setSending(false);
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Tell us what happened. We{"\u2019"}ll prepare an email to our support team with your report and account info attached.
          </Text>

          <Text style={styles.sectionTitle}>What kind of problem?</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => {
              const selected = c.id === category;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryCard, selected && styles.categoryCardSelected]}
                  onPress={() => setCategory(c.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={c.icon}
                    size={20}
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
            placeholder="What were you doing when this happened? What did you expect to see?"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {sending ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          ) : (
            <RedButton title="Send Report" onPress={handleSend} />
          )}

          <Text style={styles.footer}>
            Submitting opens your email app with the details prefilled. Or email us directly at {SUPPORT_EMAIL}.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  intro: { color: c.textSecondary, fontSize: Theme.fontSize.sm, lineHeight: 20, marginBottom: Theme.spacing.md },
  sectionTitle: { fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.bold, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Theme.spacing.md },
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
    marginBottom: Theme.spacing.md,
  },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Theme.spacing.sm, marginBottom: Theme.spacing.sm },
  errorText: { color: c.danger, fontSize: Theme.fontSize.sm, flex: 1 },
  footer: { color: c.textMuted, fontSize: Theme.fontSize.xs, textAlign: 'center', marginTop: Theme.spacing.lg, lineHeight: 16 },
});
