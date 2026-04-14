import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { saveTokens, auth } from './api';

WebBrowser.maybeCompleteAuthSession();

const RAW_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const CLIENT_ID_PREFIX = RAW_CLIENT_ID.replace('.apps.googleusercontent.com', '');
const REVERSED_CLIENT_ID = CLIENT_ID_PREFIX
  ? `com.googleusercontent.apps.${CLIENT_ID_PREFIX}`
  : '';

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function useGoogleAuth(onSuccess: () => void, onError?: (msg: string) => void) {
  const [loading, setLoading] = useState(false);

  const nativeRedirectUri = REVERSED_CLIENT_ID
    ? `${REVERSED_CLIENT_ID}:/oauth2redirect/google`
    : 'clubscentra://redirect';

  const webRedirectUri = AuthSession.makeRedirectUri();
  const redirectUri = Platform.OS === 'web' ? webRedirectUri : nativeRedirectUri;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: RAW_CLIENT_ID || 'placeholder',
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    GOOGLE_DISCOVERY
  );

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code);
    } else if (response.type === 'error') {
      onError?.(response.error?.message ?? 'Google sign-in failed');
      setLoading(false);
    } else if (response.type === 'cancel' || response.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      if (!request?.codeVerifier) throw new Error('Missing PKCE code verifier');

      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: RAW_CLIENT_ID,
          code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier },
        },
        GOOGLE_DISCOVERY
      );

      const accessToken = tokenResult.accessToken;

      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userInfoRes.ok) throw new Error('Failed to fetch Google profile');
      const userInfo = await userInfoRes.json();

      const result = await auth.google(userInfo.id);
      await saveTokens(result.accessToken, result.refreshToken);
      onSuccess();
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err.message : 'Could not complete sign-in');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!RAW_CLIENT_ID) {
      onError?.('Google sign-in is not configured.');
      return;
    }
    setLoading(true);
    await promptAsync();
  };

  return { signInWithGoogle, googleLoading: loading, googleReady: !!request };
}
