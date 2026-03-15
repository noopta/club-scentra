import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import InputField from '@/components/InputField';

const logo = require('@/assets/images/logo.png');

export default function SignupScreen() {
  const router = useRouter();
  const [emailValue, setEmailValue] = useState('');

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

        <TouchableOpacity
          style={styles.googleButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/google-auth')}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <InputField
          label="Email"
          value={emailValue}
          onChangeText={setEmailValue}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push('/(auth)/signup-details')}
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
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 80,
    paddingBottom: Theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  logoClip: {
    width: 90,
    height: 72,
    overflow: 'hidden',
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    fontStyle: 'italic',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  googleButton: {
    backgroundColor: Theme.colors.black,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  googleButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.white,
  },
  orText: {
    textAlign: 'center',
    fontSize: Theme.fontSize.md,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
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
  continueButtonText: {
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
