import React, { useState, useEffect } from 'react';
import {
  Send,
  Users,
  ExternalLink,
  LogOut,
  MessageSquare,
  Sparkles,
  Download,
  Share2,
  ChevronRight,
  PlusCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';
import { PortalLoginView } from './PortalLoginView';
import { PortalShareTab } from './PortalShareTab';
import { PortalRsvpTab } from './PortalRsvpTab';
import { PortalWishesTab } from './PortalWishesTab';
import { PortalDataFormTab } from './PortalDataFormTab';
import { useAuth } from '../../context/AuthContext';

interface ClientPortalProps {
  onBackToHome: () => void;
  onOpenInvitation: (invitation: ClientInvitationData) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  onBackToHome,
  onOpenInvitation
}) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentClient, setCurrentClient] = useState<ClientInvitationData | null>(null);
  const [ownedInvitations, setOwnedInvitations] = useState<ClientInvitationData[] | null>(null);
  const [isLoadingOwned, setIsLoadingOwned] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'share' | 'rsvp' | 'wishes'>('edit');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  // Ambil daftar undangan milik akun yang sedang login (berdasarkan client_email)
  const refreshOwnedInvitations = async () => {
    if (!user?.email) {
      setOwnedInvitations(null);
      return;
    }
    setIsLoadingOwned(true);
    try {
      const list = await AdminStore.getOwnedInvitationsAsync(user.email);
      setOwnedInvitations(list);
      // Jika user punya 1 undangan, otomatis pilih undangan tersebut
      if (list.length === 1) {
        setCurrentClient(list[0]);
      } else if (list.length > 1 && currentClient) {
        // Sinkronisasi data terkini jika sedang membuka salah satu
        const fresh = list.find((item) => item.id === currentClient.id);
        if (fresh) setCurrentClient(fresh);
      }
    } catch (err) {
      console.warn('Gagal memuat undangan milik akun:', err);
    } finally {
      setIsLoadingOwned(false);
    }
  };

  useEffect(() => {
    refreshOwnedInvitations();
  }, [user?.email]);

  // Subscribe ke perubahan store jika currentClient sedang diedit
  useEffect(() => {
    const unsubscribe = AdminStore.subscribe(() => {
      if (currentClient) {
        const fresh = AdminStore.getById(currentClient.id);
        if (fresh) setCurrentClient(fresh);
      }
    });
    return unsubscribe;
  }, [currentClient?.id]);

  // Deteksi PWA Installable
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

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

  const handleLogout = async () => {
    await signOut();
    setCurrentClient(null);
    setOwnedInvitations(null);
  };

  // 1. Loading Otentikasi Supabase
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col items-center justify-center p-6 text-[#2C2E28]">
        <div className="w-10 h-10 rounded-full border-2 border-[#C5A880]/30 border-t-[#C5A880] animate-spin mb-4" />
        <p className="font-serif text-lg font-bold text-stone-900 tracking-tight">
          Menghubungkan ke Portal Mempelai...
        </p>
        <p className="text-xs text-stone-500 mt-1">
          Memeriksa sesi login akun Anda secara aman.
        </p>
      </div>
    );
  }

  // 2. Jika Belum Login: Tampilkan Layar Login/Register Supabase Auth (Anti-Spam)
  if (!user) {
    return <PortalLoginView onBackToHome={onBackToHome} />;
  }

  // 3. Loading Data Undangan Milik Akun
  if (isLoadingOwned && !currentClient) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col items-center justify-center p-6 text-[#2C2E28]">
        <div className="w-10 h-10 rounded-full border-2 border-[#C5A880]/30 border-t-[#C5A880] animate-spin mb-4" />
        <p className="font-serif text-lg font-bold text-stone-900 tracking-tight">
          Memuat Data Undangan Anda...
        </p>
      </div>
    );
  }

  // 4. Jika Akun Belum Memilih Undangan (Misal Punya 0 atau Lebih Dari 1 Undangan)
  if (!currentClient && ownedInvitations) {
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 hidden sm:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-6 flex flex-col justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                Undangan Pernikahan Anda
              </h1>
              <p className="text-xs text-stone-500">
                Terhubung dengan akun: <strong>{user.email}</strong>
              </p>
            </div>

            {ownedInvitations.length === 0 ? (
              <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Akun Anda belum memiliki pesanan undangan yang aktif.
                  <br />
                  Silakan buat pesanan undangan Seri Standar secara instan, atau hubungi desainer studio jika Anda memesan Seri Editorial.
                </p>
                <div className="pt-2">
                  <a
                    href="/?view=order"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#414A35] hover:bg-[#343B2A] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Pesan Seri Standar (Rp49.000)</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-600">
                  Pilih undangan yang ingin Anda kelola:
                </p>
                <div className="space-y-2">
                  {ownedInvitations.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => setCurrentClient(inv)}
                      className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-[#C5A880] hover:bg-[#FAF8F5] transition-all bg-white flex items-center justify-between gap-3 shadow-2xs group cursor-pointer"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-bold text-sm text-stone-900 truncate group-hover:text-[#8C6D3F]">
                          {inv.brideName} &amp; {inv.groomName}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {inv.templateId.startsWith('standar-') ? 'Seri Standar (Rp49rb)' : 'Seri Editorial Studio'} &middot;{' '}
                          <span className={inv.status === 'published' ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                            {inv.status === 'published' ? 'Publik & Aktif' : 'Menunggu Konfirmasi'}
                          </span>
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#8C6D3F] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <button
                type="button"
                onClick={onBackToHome}
                className="hover:text-stone-900 cursor-pointer"
              >
                ← Kembali ke Beranda
              </button>
              <button
                type="button"
                onClick={refreshOwnedInvitations}
                className="hover:text-[#8C6D3F] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-stone-400">
          Sekarsiti Studio · Hak Cipta Terpelihara
        </footer>
      </div>
    );
  }

  if (!currentClient) {
    return <PortalLoginView onBackToHome={onBackToHome} />;
  }

  // 5. TAMPILAN DASHBOARD UTAMA PORTAL MEMPELAI
  const rsvpList = currentClient.rsvpList || [];
  const attendingGuests = rsvpList.filter(
    (r) => r.attendance.toLowerCase().includes('hadir') && !r.attendance.toLowerCase().includes('tidak')
  );
  const totalAttendingPax = attendingGuests.reduce((acc, curr) => acc + (curr.count || 1), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2E28] font-sans selection:bg-[#E2DDD3]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4DA] px-3 sm:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Judul Mempelai */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-serif text-base sm:text-lg font-bold text-stone-900 tracking-tight shrink-0">
              sekarsiti
            </span>
            <span className="text-stone-300">·</span>
            <div className="min-w-0 flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                {currentClient.brideName} &amp; {currentClient.groomName}
              </h2>
              {ownedInvitations && ownedInvitations.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentClient(null)}
                  className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Ganti Undangan
                </button>
              )}
            </div>
          </div>

          {/* Tombol Aksi Kanan */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenInvitation(currentClient)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141413] hover:bg-[#2C2E28] text-[#FAF8F5] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka Undangan</span>
            </button>

            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instal App</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 hover:border-stone-300 text-stone-600 text-xs font-medium transition-colors cursor-pointer"
              title="Keluar dari akun portal"
            >
              <LogOut className="w-3.5 h-3.5 sm:hidden" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* iOS Install Guide Popup */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Instal di iPhone / iPad
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tekan tombol <strong>Bagikan (Share)</strong> di peramban Safari Anda, lalu pilih opsi <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> untuk akses cepat tanpa login ulang.
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 bg-[#141413] text-[#FAF8F5] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sticky Navigation Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E8E4DA] p-3 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold cursor-pointer ${
            activeTab === 'edit' ? 'text-[#C5A880]' : 'text-stone-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Data &amp; Foto</span>
        </button>
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
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6 pb-20 md:pb-6">
        {/* Desktop Tab Selector */}
        <div className="hidden md:flex border-b border-stone-200 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-3 px-2 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'edit'
                ? 'border-[#C5A880] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Lengkapi Data &amp; Foto Template</span>
          </button>

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
        </div>

        {/* Tab Content */}
        {activeTab === 'edit' && (
          <PortalDataFormTab
            client={currentClient}
            onClientUpdated={(updatedClient) => setCurrentClient(updatedClient)}
            onOpenPreview={onOpenInvitation}
          />
        )}
        {activeTab === 'share' && <PortalShareTab client={currentClient} />}
        {activeTab === 'rsvp' && <PortalRsvpTab client={currentClient} />}
        {activeTab === 'wishes' && <PortalWishesTab client={currentClient} />}
      </main>
    </div>
  );
};
