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
          <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Welcome to Club Scentra</Text>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
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
      </ScrollView>

      <TouchableOpacity
        style={styles.bottomBar}
        onPress={() => router.push('/(auth)/login')}
        activeOpacity={0.8}
      >
        <Text style={styles.bottomBarText}>
          Have an account? <Text style={styles.bottomBarLink}>Log in</Text>
        </Text>
      </TouchableOpacity>
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
  logoImage: {
    width: 80,
    height: 80,
    
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
  bottomBar: {
    backgroundColor: Theme.colors.black,
    paddingVertical: 18,
    alignItems: 'center',
  },
  bottomBarText: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.white,
  },
  bottomBarLink: {
    textDecorationLine: 'underline',
  },
});
