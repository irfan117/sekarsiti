import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { requestRateLimitPermit } from '../utils/requestRateLimit';
import { AdminStore } from '../admin/adminStore';
import { setPortalAuthEmail } from '../utils/portalAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** true hanya jika akun terverifikasi sebagai admin studio (bukan sekadar login) */
  isAdmin: boolean;
  roleLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    pass: string,
    name?: string
  ) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  roleLoading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

/**
 * Daftar email admin studio (opsional, dipisah koma) — VITE_ADMIN_EMAILS.
 * Jika diisi, HANYA email di daftar ini yang dianggap admin (paling aman, tidak bergantung tabel).
 * Jika kosong, peran dibaca dari kolom profiles.role yang sudah ada.
 */
const ADMIN_EMAIL_ALLOWLIST = String(import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function resolveIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  const email = (user.email || '').toLowerCase();
  if (ADMIN_EMAIL_ALLOWLIST.length > 0) {
    return ADMIN_EMAIL_ALLOWLIST.includes(email);
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (error || !data) return false;
    return data.role === 'admin';
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verifikasi peran setiap kali akun berganti
  useEffect(() => {
    let active = true;
    setPortalAuthEmail(user?.email || null);
    if (!user) {
      setIsAdmin(false);
      AdminStore.setAdminRole(false);
      return;
    }
    setRoleLoading(true);
    resolveIsAdmin(user).then((admin) => {
      if (!active) return;
      setIsAdmin(admin);
      AdminStore.setAdminRole(admin);
      setRoleLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase belum dikonfigurasi di file .env') };
    }
    try {
      await requestRateLimitPermit('login');
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Percobaan login dibatasi.') };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    return { error };
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase belum dikonfigurasi di file .env') };
    }
    try {
      await requestRateLimitPermit('login');
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Percobaan pendaftaran dibatasi.') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name || undefined,
        },
      },
    });
    // Jika "Confirm email" aktif di Supabase, session belum ada sampai link email diklik
    return { error, needsEmailConfirmation: !error && !data.session };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    AdminStore.setAdminRole(false);
    setPortalAuthEmail(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, roleLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
