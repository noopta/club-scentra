import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';
import { useTheme } from '@/lib/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '@/lib/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const logo = require('@/assets/images/logo.png');

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export default function GoogleAuthScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'clubscentra' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleGoogleToken(access_token);
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In failed', response.error?.message ?? 'Something went wrong');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleToken = async (accessToken: string) => {
    setLoading(true);
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoRes.json();
      const idToken = userInfo.id;
      const { auth } = await import('@/lib/api');
      const result = await auth.google(idToken);
      const { saveTokens } = await import('@/lib/api');
      await saveTokens(result.accessToken, result.refreshToken);
      router.replace('/(tabs)/explore');
    } catch (err: unknown) {
      Alert.alert('Sign-in failed', err instanceof Error ? err.message : 'Could not complete Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async () => {
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert(
        'Not configured',
        'Google Sign-In requires a Google Client ID. Please use email/password login for now.'
      );
      return;
    }
    setLoading(true);
    await promptAsync();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContent}>
          <View style={styles.logoClip}>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <ActivityIndicator size="large" color={Theme.colors.primary} style={styles.spinner} />
          <Text style={styles.loadingText}>Signing you in...</Text>
          <Text style={styles.loadingSubtext}>Connecting your Google account to Club Scentra</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={Theme.colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.googleLogoRow}>
          <Text style={styles.googleG}>G</Text>
        </View>

        <Text style={styles.title}>Sign in with Google</Text>
        <Text style={styles.subtitle}>Continue to Club Scentra with your Google account</Text>

        <TouchableOpacity
          style={[styles.googleButton, !request && styles.buttonDisabled]}
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={!request && !!GOOGLE_CLIENT_ID}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emailButton} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.8}>
          <Text style={styles.emailButtonText}>Use email instead</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, Google will share your name, email address, and profile picture with Club Scentra.
        </Text>

        <View style={styles.privacyRow}>
          <Text style={styles.privacyLink}>Privacy Policy</Text>
          <Text style={styles.privacyDot}> · </Text>
          <Text style={styles.privacyLink}>Terms of Service</Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: typeof Theme.colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  backBtn: { position: 'absolute', top: 54, left: Theme.spacing.md, zIndex: 10, padding: Theme.spacing.sm },
  content: { flex: 1, paddingHorizontal: Theme.spacing.xl, paddingTop: 100, alignItems: 'center' },
  googleLogoRow: { width: 60, height: 60, borderRadius: 30, backgroundColor: c.white, alignItems: 'center', justifyContent: 'center', marginBottom: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
  googleG: { fontSize: 32, fontWeight: '700', color: '#4285F4' },
  title: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.xs, textAlign: 'center' },
  subtitle: { fontSize: Theme.fontSize.sm, color: c.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.xl },
  googleButton: { width: '100%', backgroundColor: '#4285F4', borderRadius: Theme.borderRadius.xl, paddingVertical: 16, alignItems: 'center', marginBottom: Theme.spacing.md },
  buttonDisabled: { opacity: 0.6 },
  googleButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold, color: c.white },
  emailButton: { width: '100%', backgroundColor: c.white, borderRadius: Theme.borderRadius.xl, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: c.border, marginBottom: Theme.spacing.xl },
  emailButtonText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium, color: c.textPrimary },
  disclaimer: { fontSize: Theme.fontSize.xs, color: c.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: Theme.spacing.sm },
  privacyRow: { flexDirection: 'row', alignItems: 'center' },
  privacyLink: { fontSize: Theme.fontSize.xs, color: '#4285F4' },
  privacyDot: { fontSize: Theme.fontSize.xs, color: c.textSecondary },
  loadingContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Theme.spacing.xl },
  logoClip: { width: 90, height: 72, overflow: 'hidden', marginBottom: Theme.spacing.xl },
  logoImage: { width: 90, height: 90 },
  spinner: { marginBottom: Theme.spacing.lg },
  loadingText: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: c.textPrimary, marginBottom: Theme.spacing.xs },
  loadingSubtext: { fontSize: Theme.fontSize.sm, color: c.textSecondary, textAlign: 'center' },
});
