import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';
import { auth } from '@/lib/api';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!current) return 'Enter your current password.';
    if (next.length < 8) return 'New password must be at least 8 characters.';
    if (!/[A-Z]/.test(next)) return 'New password must include an uppercase letter.';
    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(next)) return 'New password must include a number or symbol.';
    if (next !== confirm) return 'Passwords do not match.';
    if (next === current) return 'New password must be different from your current password.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    try {
      await auth.changePassword(current, next);
      const successMsg = 'Password updated successfully.';
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.alert(successMsg);
      } else {
        Alert.alert('Done', successMsg);
      }
      router.back();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not change password.');
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>For your security, please enter your current password before choosing a new one.</Text>

        <InputField label="Current password" value={current} onChangeText={setCurrent} secureTextEntry autoCapitalize="none" />
        <InputField label="New password" value={next} onChangeText={setNext} secureTextEntry autoCapitalize="none" />
        <InputField label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" />

        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>Password requirements</Text>
          <Text style={styles.rule}>• At least 8 characters</Text>
          <Text style={styles.rule}>• At least one uppercase letter</Text>
          <Text style={styles.rule}>• At least one number or symbol</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {submitting ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        ) : (
          <RedButton title="Update Password" onPress={handleSubmit} />
        )}
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
  scrollContent: { paddingHorizontal: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl },
  intro: { color: c.textSecondary, fontSize: Theme.fontSize.sm, marginBottom: Theme.spacing.md, lineHeight: 20 },
  rules: { backgroundColor: c.cardBackground, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, marginTop: Theme.spacing.sm, marginBottom: Theme.spacing.md },
  rulesTitle: { color: c.textPrimary, fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.semibold, marginBottom: 6 },
  rule: { color: c.textSecondary, fontSize: Theme.fontSize.sm, lineHeight: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Theme.spacing.sm, marginBottom: Theme.spacing.sm },
  errorText: { color: c.danger, fontSize: Theme.fontSize.sm, flex: 1 },
});
