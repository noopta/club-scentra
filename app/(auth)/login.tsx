import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import InputField from '@/components/InputField';
import { useAuth } from '@/lib/AuthContext';
import { useGoogleAuth } from '@/lib/useGoogleAuth';

const logo = require('@/assets/images/logo.png');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { signInWithGoogle, googleLoading } = useGoogleAuth(
    () => router.replace('/(tabs)/explore'),
    (msg) => setErrorMsg(msg)
  );

  const handleLogin = async () => {
    setErrorMsg('');
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your username/email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      router.replace('/(tabs)/explore');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid credentials');
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

        <Text style={styles.title}>Log into Club Scentra</Text>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={() => { setErrorMsg(''); signInWithGoogle(); }}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color={Theme.colors.white} />
          ) : (
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <InputField
          label="Username/Email"
          value={identifier}
          onChangeText={(t) => { setErrorMsg(''); setIdentifier(t); }}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <InputField
          label="Password"
          value={password}
          onChangeText={(t) => { setErrorMsg(''); setPassword(t); }}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Theme.colors.textPrimary} />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.signupButtonText}>No account? Sign up</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingHorizontal: Theme.spacing.xl, paddingTop: 80, paddingBottom: Theme.spacing.xl },
  logoContainer: { alignItems: 'center', marginBottom: Theme.spacing.lg },
  logoClip: { width: 90, height: 72, overflow: 'hidden' },
  logoImage: { width: 90, height: 90 },
  title: { fontSize: Theme.fontSize.xxl, fontWeight: Theme.fontWeight.bold, fontStyle: 'italic', color: Theme.colors.textPrimary, textAlign: 'center', marginBottom: Theme.spacing.lg },
  errorBanner: { backgroundColor: '#FFF0F0', borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: '#FFCDD2', padding: Theme.spacing.md, marginBottom: Theme.spacing.md },
  errorText: { fontSize: Theme.fontSize.sm, color: Theme.colors.primary, textAlign: 'center' },
  googleButton: { backgroundColor: Theme.colors.black, borderRadius: Theme.borderRadius.xl, paddingVertical: 16, alignItems: 'center', marginBottom: Theme.spacing.lg },
  buttonDisabled: { opacity: 0.6 },
  googleButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: Theme.colors.white },
  orText: { textAlign: 'center', fontSize: Theme.fontSize.md, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.lg },
  loginButton: { backgroundColor: Theme.colors.white, borderRadius: Theme.borderRadius.xl, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border, marginTop: Theme.spacing.md },
  loginButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: Theme.colors.textPrimary },
  signupButton: { backgroundColor: Theme.colors.black, borderRadius: Theme.borderRadius.xl, paddingVertical: 16, alignItems: 'center', marginTop: Theme.spacing.md },
  signupButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: Theme.colors.white },
});
