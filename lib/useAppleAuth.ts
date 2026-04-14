import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

type Params = {
  appleLogin: (identityToken: string, email: string | null, fullName: string | null) => Promise<void>;
  onSuccess: () => void;
  onError?: (msg: string) => void;
};

export function useAppleAuth({ appleLogin, onSuccess, onError }: Params) {
  const isAvailable = Platform.OS === 'ios';

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token');
      }

      const fullName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(' ') || null
        : null;

      await appleLogin(credential.identityToken, credential.email ?? null, fullName);
      onSuccess();
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
      onError?.(err instanceof Error ? err.message : 'Apple sign-in failed');
    }
  };

  return { signInWithApple, isAppleAvailable: isAvailable };
}
