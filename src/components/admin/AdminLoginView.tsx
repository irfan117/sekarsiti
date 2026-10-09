import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginViewProps {
  onBackToLanding: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onBackToLanding }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Fallback untuk mode development jika Supabase belum diset
        if (password === 'admin123' || email.includes('admin')) {
          localStorage.setItem('sekarsiti_mock_admin_session', 'true');
          window.location.reload();
          return;
        } else {
          throw new Error('Supabase belum dikoneksikan. Gunakan kata sandi dev: "admin123"');
        }
      }

      const { error } = await signIn(email, password);
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181816] text-[#FAF8F5] flex flex-col justify-center items-center px-4 sm:px-6 py-12 selection:bg-[#C5A880]/30 selection:text-[#FAF8F5]">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
            <ShieldCheck className="w-7 h-7 text-[#C5A880]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-tight text-[#FAF8F5]">
            sekarsiti studio
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-light">
            Portal Khusus Operasional & Manajemen Undangan
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#21211E] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-stone-300">
                Email Operator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sekarsiti.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-stone-300">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#C5A880] hover:bg-[#B3956D] active:scale-[0.99] text-[#181816] font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {!isSupabaseConfigured && (
            <p className="text-[11px] text-stone-500 text-center">
              Mode Mock Development: Gunakan kata sandi <span className="font-mono text-stone-400">admin123</span>
            </p>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </button>
        </div>

      </div>
    </div>
  );
};
