import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, users, saveTokens, clearTokens, getAccessToken, User } from './api';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  appleLogin: (identityToken: string, email: string | null, fullName: string | null) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await users.me();
          setUser(me);
        }
      } catch {
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await auth.login(identifier, password);
    await saveTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  };

  const googleLogin = async (idToken: string) => {
    const res = await auth.google(idToken);
    await saveTokens(res.accessToken, res.refreshToken);
    if (res.user) {
      setUser(res.user);
    } else {
      const me = await users.me();
      setUser(me);
    }
  };

  const appleLogin = async (identityToken: string, email: string | null, fullName: string | null) => {
    const res = await auth.apple(identityToken, email, fullName);
    await saveTokens(res.accessToken, res.refreshToken);
    if (res.user) {
      setUser(res.user);
    } else {
      const me = await users.me();
      setUser(me);
    }
  };

  const register = async (data: { username: string; email: string; password: string; displayName?: string }) => {
    const res = await auth.register(data);
    await saveTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await users.me();
      setUser(me);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      googleLogin,
      appleLogin,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
