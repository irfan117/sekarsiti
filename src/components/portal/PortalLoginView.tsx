import React from 'react';
import { Heart, KeyRound, Lock, Send, AlertCircle } from 'lucide-react';

interface PortalLoginViewProps {
  accessCodeInput: string;
  pinCodeInput: string;
  loginError: string;
  onChangeAccessCode: (val: string) => void;
  onChangePinCode: (val: string) => void;
  onSubmitLogin: (e: React.FormEvent) => void;
  onBackToHome: () => void;
}

export const PortalLoginView: React.FC<PortalLoginViewProps> = ({
  accessCodeInput,
  pinCodeInput,
  loginError,
  onChangeAccessCode,
  onChangePinCode,
  onSubmitLogin,
  onBackToHome
}) => {
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
          <span className="text-xs text-[#8C6D3F] font-medium">
            · Portal Mempelai
          </span>
        </div>

        <button
          onClick={onBackToHome}
          className="text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          ← Kembali ke Beranda
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
              Masuk untuk membuat link sebar WhatsApp personal dan memantau konfirmasi kehadiran katering secara langsung.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={onSubmitLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Kode Akses Undangan</span>
              </label>
              <input
                type="text"
                value={accessCodeInput}
                onChange={(e) => onChangeAccessCode(e.target.value)}
                placeholder="Contoh: kirana-adhitya atau INV-2027-001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50 focus:border-[#C5A880] transition-all bg-stone-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Sandi / PIN Akses</span>
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinCodeInput}
                onChange={(e) => onChangePinCode(e.target.value)}
                placeholder="4 digit sandi (misal: 7429)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50 focus:border-[#C5A880] transition-all bg-stone-50/50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#141413] hover:bg-[#2C2E28] text-[#FAF8F3] py-2.5 rounded-xl font-medium text-xs tracking-wider uppercase transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Masuk ke Portal</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-stone-400">
        Sekarsiti Studio · Hak Cipta Terpelihara
      </footer>
    </div>
  );
};
