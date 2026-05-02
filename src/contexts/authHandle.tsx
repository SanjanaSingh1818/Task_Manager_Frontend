import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';
import type { Profile } from '../types';

type AuthUser = { id: string; name: string; email: string; role: string };

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'member') => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildProfile(user: AuthUser): Profile {
  return {
    id: user.id,
    email: user.email,
    full_name: user.name,
    role: user.role as Profile['role'],
    created_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = api.getToken();
      console.log('[auth] init, token exists:', Boolean(token));

      if (!token) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { user } = await api.auth.getMe();
        console.log('[auth] /me loaded:', Boolean(user));
        setUser(user);
        setProfile(buildProfile(user));
      } catch (err) {
        console.error('[auth] init failed:', err);
        api.clearToken();
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  async function signUp(email: string, password: string, fullName: string, role: 'admin' | 'member') {
    try {
      console.log('[auth] signup start:', email);
      const { token } = await api.auth.signup(email, password, fullName, role);
      api.setToken(token);
      const { user } = await api.auth.getMe();
      console.log('[auth] signup /me loaded:', Boolean(user));
      setUser(user);
      setProfile(buildProfile(user));
      return { error: null };
    } catch (err: any) {
      console.error('[auth] signup failed:', err);
      api.clearToken();
      setUser(null);
      setProfile(null);
      return { error: err.message || 'Unable to create account.' };
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log('[auth] signin start:', email);
      const { token } = await api.auth.login(email, password);
      api.setToken(token);
      const { user } = await api.auth.getMe();
      console.log('[auth] signin /me loaded:', Boolean(user));
      setUser(user);
      setProfile(buildProfile(user));
      return { error: null };
    } catch (err: any) {
      console.error('[auth] signin failed:', err);
      api.clearToken();
      setUser(null);
      setProfile(null);
      return { error: err.message || 'Unable to sign in.' };
    }
  }

  async function signOut() {
    console.log('[auth] signout');
    api.clearToken();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      isAdmin: profile?.role === 'admin',
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
