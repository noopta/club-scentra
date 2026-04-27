import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import InputField from '@/components/InputField';
import RedButton from '@/components/RedButton';
import { auth } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    if (Platform.OS !== 'web') {
      Alert.alert('Could not change password', msg);
    }
  };

  const handleSave = async () => {
    setError(null);
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      showError('New password must include an uppercase letter.');
      return;
    }
    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showError('New password must include a number or symbol.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await auth.changePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      if (Platform.OS === 'web') {
        router.back();
      } else {
        Alert.alert('Password updated', 'Your password has been changed.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Could not change password');
    } finally {
      setLoading(false);
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Choose a strong password with at least 8 characters, an uppercase letter, and a number or symbol.
          </Text>

          {user?.email ? (
            <Text style={styles.accountLine}>Account: {user.email}</Text>
          ) : null}

          <InputField
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            placeholder="Leave blank if you signed up with Google/Apple"
          />

          <InputField
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />

          <InputField
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />

          <View style={styles.rules}>
            <Text style={styles.rulesTitle}>Password requirements</Text>
            <Text style={styles.rule}>• At least 8 characters</Text>
            <Text style={styles.rule}>• At least one uppercase letter</Text>
            <Text style={styles.rule}>• At least one number or symbol</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          ) : (
            <RedButton title="Update Password" onPress={handleSave} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  accountLine: { fontSize: Theme.fontSize.sm, color: c.textMuted, marginBottom: Theme.spacing.md },
  rules: { backgroundColor: c.cardBackground, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, marginTop: Theme.spacing.sm, marginBottom: Theme.spacing.md },
  rulesTitle: { color: c.textPrimary, fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.semibold, marginBottom: 6 },
  rule: { color: c.textSecondary, fontSize: Theme.fontSize.sm, lineHeight: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Theme.spacing.sm, marginBottom: Theme.spacing.sm },
  errorText: { color: c.danger, fontSize: Theme.fontSize.sm, flex: 1 },
});
