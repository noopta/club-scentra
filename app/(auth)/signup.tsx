import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Theme } from '@/constants/Theme';
import InputField from '@/components/InputField';
import { useAuth } from '@/lib/AuthContext';
import { useGoogleAuth } from '@/lib/useGoogleAuth';
import { useAppleAuth } from '@/lib/useAppleAuth';

const logo = require('@/assets/images/logo.png');
const googleLogo = require('@/assets/images/google-logo.png');

export default function SignupScreen() {
  const router = useRouter();
  const { googleLogin, appleLogin } = useAuth();
  const [emailValue, setEmailValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { signInWithGoogle, googleLoading } = useGoogleAuth({
    googleLogin,
    onSuccess: () => router.replace('/(tabs)/explore'),
    onError: (msg) => setErrorMsg(msg),
  });

  const { signInWithApple } = useAppleAuth({
    appleLogin,
    onSuccess: () => router.replace('/(tabs)/explore'),
    onError: (msg) => setErrorMsg(msg),
  });

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
            <ActivityIndicator color={Theme.colors.textPrimary} />
          ) : (
            <View style={styles.socialButtonInner}>
              <Image source={googleLogo} style={styles.googleIcon} resizeMode="contain" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={Theme.borderRadius.xl}
            style={styles.appleButton}
            onPress={() => { setErrorMsg(''); signInWithApple(); }}
          />
        )}

        <Text style={styles.orText}>or</Text>

        <InputField
          label="Email"
          value={emailValue}
          onChangeText={(t) => { setErrorMsg(''); setEmailValue(t); }}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push({ pathname: '/(auth)/signup-details', params: { email: emailValue } })}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue with email</Text>
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
  scrollContent: { paddingHorizontal: Theme.spacing.xl, paddingTop: 80, paddingBottom: Theme.spacing.xl },
  logoContainer: { alignItems: 'center', marginBottom: Theme.spacing.lg },
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
  errorBanner: {
    backgroundColor: '#FFF0F0',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  errorText: { fontSize: Theme.fontSize.sm, color: Theme.colors.primary, textAlign: 'center' },
  googleButton: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 14,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#DADCE0',
    marginBottom: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  socialButtonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: '#3C4043' },
  appleButton: { width: '100%', height: 50, marginBottom: Theme.spacing.md },
  buttonDisabled: { opacity: 0.6 },
  orText: {
    textAlign: 'center',
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
  },
  continueButton: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: Theme.spacing.md,
  },
  continueButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: Theme.colors.textPrimary },
  loginButton: {
    backgroundColor: Theme.colors.black,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  loginButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: Theme.colors.white },
});
