import React, { useState } from 'react';
import { Heart, Lock, Send, AlertCircle, Mail, User as UserIcon, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PortalLoginViewProps {
  onBackToHome: () => void;
}

/**
 * Login Portal Mempelai — 100% Menggunakan Supabase Auth
 * Anti-spam, aman, dan menggunakan akun yang sama persis dengan saat memesan undangan.
 */
export const PortalLoginView: React.FC<PortalLoginViewProps> = ({ onBackToHome }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfo(null);
    setAuthLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
      } else {
        if (!name.trim()) throw new Error('Mohon isi nama lengkap calon pengantin.');
        const { error, needsEmailConfirmation } = await signUp(email.trim(), password, name.trim());
        if (error) throw error;
        if (needsEmailConfirmation) {
          setAuthInfo('Akun berhasil dibuat. Buka email Anda untuk konfirmasi, lalu masuk kembali di sini.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Otentikasi gagal. Silakan periksa kembali email dan kata sandi Anda.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between text-[#2C2E28] font-sans selection:bg-[#E2DDD3]">
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E8E4DA] bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="font-serif text-lg tracking-wider font-semibold text-[#141413] hover:text-[#C5A880] transition-colors cursor-pointer"
          >
            sekarsiti.
          </button>
          <span className="text-xs text-[#8C6D3F] font-medium">· Portal Mempelai</span>
        </div>
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A880]/30 mx-auto flex items-center justify-center text-[#C5A880]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              Portal Mempelai
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
              Masuk dengan akun yang Anda gunakan saat memesan undangan untuk mengelola buku tamu, menyebarkan link WhatsApp, dan memantau RSVP.
            </p>
          </div>

          <div className="flex p-1 bg-stone-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthError(null);
                setAuthInfo(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-[#2C2E28] shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setAuthError(null);
                setAuthInfo(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-[#2C2E28] shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          {authInfo && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              {authInfo}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Lengkap Calon Pengantin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kirana & Adhitya"
                    className="w-full text-xs sm:text-sm pl-9 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full text-xs sm:text-sm pl-9 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full text-xs sm:text-sm pl-9 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#141413] hover:bg-[#2C2E28] text-[#FAF8F3] py-2.5 rounded-xl font-medium text-xs tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Portal Mempelai' : 'Daftar & Masuk ke Portal'}</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-stone-400">
              Otentikasi aman &middot; Bebas spam 100%
            </span>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-stone-400">
        Sekarsiti Studio · Hak Cipta Terpelihara
      </footer>
    </div>
  );
};
