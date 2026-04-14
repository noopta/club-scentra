import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { saveTokens, auth } from './api';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

function buildRedirectUri(): string {
  if (Platform.OS === 'web') {
    return AuthSession.makeRedirectUri();
  }
  return AuthSession.makeRedirectUri({
    scheme: 'com.clubscentra.app',
    path: 'redirect',
  });
}

export const GOOGLE_REDIRECT_URI = buildRedirectUri();

export function useGoogleAuth(onSuccess: () => void, onError?: (msg: string) => void) {
  const [loading, setLoading] = useState(false);

  console.log('[GoogleAuth] redirect_uri =', GOOGLE_REDIRECT_URI);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID || 'placeholder',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: GOOGLE_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleToken(access_token);
    } else if (response?.type === 'error') {
      const msg = response.error?.message ?? 'Google sign-in failed';
      onError?.(msg);
      setLoading(false);
    } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const handleToken = async (accessToken: string) => {
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoRes.json();
      const result = await auth.google(userInfo.id);
      await saveTokens(result.accessToken, result.refreshToken);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not complete sign-in';
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!GOOGLE_CLIENT_ID) {
      onError?.('Google sign-in is not configured. Please use email/password.');
      return;
    }
    console.log('[GoogleAuth] Starting with redirect_uri =', GOOGLE_REDIRECT_URI);
    setLoading(true);
    await promptAsync();
  };

  return { signInWithGoogle, googleLoading: loading, googleReady: !!request, redirectUri: GOOGLE_REDIRECT_URI };
}
