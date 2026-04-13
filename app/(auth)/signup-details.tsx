import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import InputField from '@/components/InputField';
import { useAuth } from '@/lib/AuthContext';

const logo = require('@/assets/images/logo.png');

export default function SignupDetailsScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const handleCreate = async () => {
    if (!username.trim() || !emailValue.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (!hasMinLength || !hasNumberOrSymbol || !hasUppercase) {
      Alert.alert('Weak password', 'Password does not meet the requirements.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Terms required', 'Please agree to the Terms and Conditions.');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: emailValue.trim(),
        password,
        displayName: username.trim(),
      });
      router.replace('/(tabs)/explore');
    } catch (err: unknown) {
      Alert.alert('Sign up failed', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoClip}>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          </View>
        </View>

        <Text style={styles.title}>Welcome to Club Scentra</Text>

        <InputField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <InputField
          label="Email"
          value={emailValue}
          onChangeText={setEmailValue}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <InputField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.requirements}>
          <View style={styles.requirementRow}>
            <View style={[styles.requirementDot, hasMinLength && styles.requirementMet]} />
            <Text style={styles.requirementText}>8 characters minimum</Text>
          </View>
          <View style={styles.requirementRow}>
            <View style={[styles.requirementDot, hasNumberOrSymbol && styles.requirementMet]} />
            <Text style={styles.requirementText}>Contains a number or symbol</Text>
          </View>
          <View style={styles.requirementRow}>
            <View style={[styles.requirementDot, hasUppercase && styles.requirementMet]} />
            <Text style={styles.requirementText}>1 uppercase character</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={14} color={Theme.colors.white} />}
          </View>
          <Text style={styles.checkboxLabel}>
            Agree to{' '}
            <Text style={styles.termsLink} onPress={() => router.push('/terms')}>
              Terms and Conditions
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Theme.colors.textPrimary} />
          ) : (
            <Text style={styles.createButtonText}>Create account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: Theme.spacing.xl,
  },
  logoContainer: { alignItems: 'center', marginBottom: Theme.spacing.md },
  logoClip: { width: 90, height: 72, overflow: 'hidden' },
  logoImage: { width: 90, height: 90 },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    fontStyle: 'italic',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  requirements: { marginBottom: Theme.spacing.md },
  requirementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  requirementDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.border,
    marginRight: Theme.spacing.sm,
  },
  requirementMet: { backgroundColor: Theme.colors.success },
  requirementText: { fontSize: Theme.fontSize.sm, color: Theme.colors.textSecondary },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.lg },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  checkboxChecked: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  checkboxLabel: { fontSize: Theme.fontSize.sm, color: Theme.colors.textPrimary },
  termsLink: { textDecorationLine: 'underline', fontWeight: Theme.fontWeight.medium },
  createButton: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  buttonDisabled: { opacity: 0.6 },
  createButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.textPrimary,
  },
  loginButton: {
    backgroundColor: Theme.colors.black,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  loginButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.white,
  },
});
