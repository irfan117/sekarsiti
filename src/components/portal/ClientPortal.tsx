import React, { useState, useEffect } from 'react';
import {
  Send,
  Users,
  ExternalLink,
  LogOut,
  MessageSquare,
  Sparkles,
  Download,
  Share
} from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';
import { PortalLoginView } from './PortalLoginView';
import { PortalShareTab } from './PortalShareTab';
import { PortalRsvpTab } from './PortalRsvpTab';
import { PortalWishesTab } from './PortalWishesTab';
import { PortalInfoTab } from './PortalInfoTab';
import { savePortalSession, getPortalSession, clearPortalSession } from '../../utils/portalAuth';

interface ClientPortalProps {
  initialCode?: string;
  initialPin?: string;
  onBackToHome: () => void;
  onOpenInvitation: (invitation: ClientInvitationData) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  initialCode = '',
  initialPin = '',
  onBackToHome,
  onOpenInvitation
}) => {
  const [accessCodeInput, setAccessCodeInput] = useState(initialCode);
  const [pinCodeInput, setPinCodeInput] = useState(initialPin);
  const [currentClient, setCurrentClient] = useState<ClientInvitationData | null>(null);
  const [loginError, setLoginError] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(() => {
    // Mulai dengan loading true jika ada initial params atau sesi tersimpan di storage
    return Boolean((initialCode && initialPin) || getPortalSession());
  });
  const [activeTab, setActiveTab] = useState<'share' | 'rsvp' | 'wishes' | 'info'>('share');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  // Deteksi kemampuan instalasi PWA di Android / Chrome
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cek jika pengguna memakai perangkat iOS (iPhone/iPad)
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIos && !isStandalone) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIosGuide(true);
    }
  };

  // Pulihkan sesi login saat halaman di-refresh atau membaca URL param
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // 1. Prioritas utama: Parameter URL langsung (misal link khusus dari WhatsApp/Admin)
      if (initialCode && initialPin) {
        try {
          const found = await AdminStore.getByAccessAsync(initialCode, initialPin);
          if (!isMounted) return;
          setIsLoadingSession(false);
          if (found) {
            setCurrentClient(found);
            savePortalSession(initialCode, initialPin, found.id);
            // Bersihkan parameter PIN sensitif dari URL address bar
            if (typeof window !== 'undefined' && window.history?.replaceState) {
              window.history.replaceState({}, '', window.location.pathname + '?view=portal');
            }
          } else {
            setLoginError('Kode akses atau PIN sandi tidak sesuai.');
          }
        } catch (err) {
          if (!isMounted) return;
          setIsLoadingSession(false);
          setLoginError('Gagal memverifikasi akses portal.');
        }
        return;
      }

      // 2. Prioritas kedua: Pulihkan sesi yang tersimpan di localStorage (saat di-refresh)
      const savedSession = getPortalSession();
      if (savedSession) {
        setAccessCodeInput(savedSession.code);
        setPinCodeInput(savedSession.pin);
        try {
          const found = await AdminStore.getByAccessAsync(savedSession.code, savedSession.pin);
          if (!isMounted) return;
          setIsLoadingSession(false);
          if (found) {
            setCurrentClient(found);
            // Pertahankan view=portal di URL
            if (typeof window !== 'undefined' && window.history?.replaceState) {
              window.history.replaceState({}, '', window.location.pathname + '?view=portal');
            }
          } else {
            // Sesi sudah kedaluwarsa atau PIN diubah di database oleh admin
            clearPortalSession();
          }
        } catch (err) {
          if (!isMounted) return;
          setIsLoadingSession(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoadingSession(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [initialCode, initialPin]);

  useEffect(() => {
    const unsubscribe = AdminStore.subscribe(() => {
      if (currentClient) {
        const fresh = AdminStore.getById(currentClient.id);
        if (fresh) setCurrentClient(fresh);
      }
    });
    return unsubscribe;
  }, [currentClient]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const code = accessCodeInput.trim();
    const pin = pinCodeInput.trim();

    if (!code || !pin) {
      setLoginError('Silakan masukkan Kode Akses dan PIN Sandi Anda.');
      return;
    }

    const found = await AdminStore.getByAccessAsync(code, pin);
    if (found) {
      setCurrentClient(found);
      setLoginError('');
      savePortalSession(code, pin, found.id);
      // Bersihkan URL dan set ke ?view=portal agar aman saat di-refresh
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, '', window.location.pathname + '?view=portal');
      }
    } else {
      setLoginError('Kombinasi Kode Akses atau PIN sandi salah. Silakan periksa kembali pesan dari Admin Sekarsiti.');
    }
  };

  const handleLogout = () => {
    clearPortalSession();
    setCurrentClient(null);
    setAccessCodeInput('');
    setPinCodeInput('');
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState({}, '', window.location.pathname + '?view=portal');
    }
  };

  // Indikator loading halus saat memverifikasi sesi tersimpan saat di-refresh
  if (isLoadingSession && !currentClient) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col items-center justify-center p-6 text-[#2C2E28]">
        <div className="w-10 h-10 rounded-full border-2 border-[#C5A880]/30 border-t-[#C5A880] animate-spin mb-4" />
        <p className="font-serif text-lg font-bold text-stone-900 tracking-tight">
          Menghubungkan ke Portal Mempelai...
        </p>
        <p className="text-xs text-stone-500 mt-1">
          Memulihkan sesi login Anda secara aman.
        </p>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <PortalLoginView
        accessCodeInput={accessCodeInput}
        pinCodeInput={pinCodeInput}
        loginError={loginError}
        onChangeAccessCode={setAccessCodeInput}
        onChangePinCode={setPinCodeInput}
        onSubmitLogin={handleLogin}
        onBackToHome={onBackToHome}
      />
    );
  }

  const rsvpList = currentClient.rsvpList || [];
  const attendingGuests = rsvpList.filter(
    r => r.attendance.toLowerCase().includes('hadir') && !r.attendance.toLowerCase().includes('tidak')
  );
  const totalAttendingPax = attendingGuests.reduce((acc, curr) => acc + (curr.count || 1), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2E28] font-sans selection:bg-[#E2DDD3]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4DA] px-3 sm:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          
          {/* Sisi Kiri: Nama Pasangan & Status Ringkas */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-serif text-base sm:text-lg font-bold text-stone-900 tracking-tight shrink-0">
              sekarsiti
            </span>
            <span className="text-stone-300">·</span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                {currentClient.brideName} &amp; {currentClient.groomName}
              </h2>
            </div>
          </div>

          {/* Sisi Kanan: Tombol Akses Cepat */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Tombol Install App PWA (Muncul Khusus Klien) */}
            {isInstallable && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="text-[11px] bg-[#181816] hover:bg-stone-800 text-[#C5A880] px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                title="Install Aplikasi di Layar Utama HP"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A880] animate-bounce" />
                <span className="hidden xs:inline sm:inline">Install App</span>
              </button>
            )}

            <button
              onClick={() => onOpenInvitation(currentClient)}
              className="text-xs bg-[#FAF7F2] hover:bg-[#F3EAD9] text-stone-800 border border-[#C5A880]/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-medium cursor-pointer whitespace-nowrap"
            >
              <span>Lihat Undangan</span>
              <ExternalLink className="w-3 h-3 text-[#C5A880]" />
            </button>

            <button
              onClick={handleLogout}
              className="text-xs text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              title="Keluar Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Modal Petunjuk Install iOS Safari jika dibutuhkan */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-left border border-stone-200 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                Install di Layar Utama HP
              </span>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Agar dapat dibuka sewaktu-waktu seperti aplikasi native tanpa membuka browser:
            </p>
            <div className="space-y-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <p className="flex items-center gap-2">
                <Share className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>1. Ketuk ikon <strong>Bagikan / Share</strong> di bawah browser.</span>
              </p>
              <p className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>2. Gulir lalu pilih <strong>Add to Home Screen (Tambah ke Layar Utama)</strong>.</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-[#181816] text-[#FAF8F5] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E8E4DA] p-3 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('share')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'share' ? 'text-[#C5A880]' : 'text-stone-500'
          }`}
        >
          <Send className="w-5 h-5" />
          <span>Sebar WA</span>
        </button>
        <button
          onClick={() => setActiveTab('rsvp')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'rsvp' ? 'text-[#C5A880]' : 'text-stone-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>RSVP ({totalAttendingPax})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishes')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'wishes' ? 'text-[#C5A880]' : 'text-stone-500'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Doa</span>
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'info' ? 'text-[#C5A880]' : 'text-stone-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Data Acara</span>
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6 pb-20 md:pb-6">
        <div className="hidden md:flex border-b border-stone-200 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('share')}
            className={`pb-3 px-2 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'share'
                ? 'border-[#C5A880] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Send className="w-4 h-4 text-[#C5A880]" />
            <span>Sebar Undangan WhatsApp ({(currentClient.guestLinks || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rsvp')}
            className={`pb-3 px-2 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'rsvp'
                ? 'border-[#C5A880] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4 text-[#C5A880]" />
            <span>Pantau RSVP &amp; Katering ({totalAttendingPax} Hadir)</span>
          </button>

          <button
            onClick={() => setActiveTab('wishes')}
            className={`pb-3 px-2 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'wishes'
                ? 'border-[#C5A880] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#C5A880]" />
            <span>Doa &amp; Buku Tamu ({(currentClient.guestbookEntries || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-2 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#C5A880] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Data Acara &amp; Kado</span>
          </button>
        </div>

        {activeTab === 'share' && <PortalShareTab client={currentClient} />}
        {activeTab === 'rsvp' && <PortalRsvpTab client={currentClient} />}
        {activeTab === 'wishes' && <PortalWishesTab client={currentClient} />}
        {activeTab === 'info' && <PortalInfoTab client={currentClient} />}
      </main>
    </div>
  );
};
