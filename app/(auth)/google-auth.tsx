import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

const logo = require('@/assets/images/logo.png');

export default function GoogleAuthScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'choose' | 'loading' | 'confirm'>('choose');

  const mockAccounts = [
    { email: 'sara.nova@gmail.com', name: 'Sara Nova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    { email: 'saraaa13@gmail.com', name: 'Saraaa13', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  ];

  const handleSelectAccount = () => {
    setStep('loading');
    setTimeout(() => {
      router.replace('/(tabs)/explore');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={Theme.colors.textPrimary} />
      </TouchableOpacity>

      {step === 'choose' && (
        <View style={styles.content}>
          <View style={styles.googleLogoRow}>
            <Text style={styles.googleG}>G</Text>
          </View>

          <Text style={styles.title}>Sign in with Google</Text>
          <Text style={styles.subtitle}>Choose an account to continue to Club Scentra</Text>

          <View style={styles.accountsCard}>
            {mockAccounts.map((account, i) => (
              <TouchableOpacity
                key={account.email}
                style={[styles.accountRow, i < mockAccounts.length - 1 && styles.accountRowBorder]}
                onPress={handleSelectAccount}
                activeOpacity={0.7}
              >
                <Image source={{ uri: account.avatar }} style={styles.avatar} />
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountEmail}>{account.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.accountRow, styles.accountRowBorder]} activeOpacity={0.7}>
              <View style={styles.addIcon}>
                <Ionicons name="person-add-outline" size={20} color={Theme.colors.textPrimary} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>Use another account</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            By continuing, Google will share your name, email address, and profile picture with Club Scentra.
          </Text>

          <View style={styles.privacyRow}>
            <Text style={styles.privacyLink}>Privacy Policy</Text>
            <Text style={styles.privacyDot}> · </Text>
            <Text style={styles.privacyLink}>Terms of Service</Text>
          </View>
        </View>
      )}

      {step === 'loading' && (
        <View style={styles.loadingContent}>
          <View style={styles.logoClip}>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <ActivityIndicator size="large" color={Theme.colors.primary} style={styles.spinner} />
          <Text style={styles.loadingText}>Signing you in...</Text>
          <Text style={styles.loadingSubtext}>Connecting your Google account to Club Scentra</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  backBtn: {
    position: 'absolute',
    top: 54,
    left: Theme.spacing.md,
    zIndex: 10,
    padding: Theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 100,
    alignItems: 'center',
  },
  googleLogoRow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  googleG: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4285F4',
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  accountsCard: {
    width: '100%',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  accountRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Theme.spacing.md,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Theme.colors.textPrimary,
  },
  accountEmail: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Theme.spacing.sm,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyLink: {
    fontSize: Theme.fontSize.xs,
    color: '#4285F4',
  },
  privacyDot: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  logoClip: {
    width: 90,
    height: 72,
    overflow: 'hidden',
    marginBottom: Theme.spacing.xl,
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  spinner: {
    marginBottom: Theme.spacing.lg,
  },
  loadingText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  loadingSubtext: {
    fontSize: Theme.fontSize.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});
