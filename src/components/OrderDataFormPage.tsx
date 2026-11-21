import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Heart,
  Calendar,
  CreditCard,
  Music,
  Loader2,
  Play,
  Pause,
  Check,
  ShieldCheck,
  Lock,
  ExternalLink,
  Copy,
  Zap,
  Eye,
  Trash2,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { AdminStore } from '../admin/adminStore';
import { STANDARD_TEMPLATES } from '../data/standardCatalog';
import { TEMPLATE_REGISTRY } from '../admin/templateRegistry';
import { InvitationItem } from '../types';
import { TemplateId, ClientInvitationData } from '../types/clientInvitation';
import {
  uploadToCloudinary,
  isCloudinaryConfigured,
  deleteFromCloudinary,
} from '../utils/cloudinaryUpload';
import { smartPlaceAssets } from '../services/mediaAssetAssistant';
import {
  fetchMusicTracks,
  MusicTrack,
  uploadMusicToCloudinary,
} from '../services/musicService';
import { triggerMidtransCheckout, isMidtransConfigured } from '../services/midtransService';
import { safeCopyToClipboard } from '../utils/clipboardUtils';
import { savePortalSession, getPortalSession } from '../utils/portalAuth';

// Import all 9 Standard Template components for live interactive preview
import { RoyalClassicTemplate } from '../templates/standard/RoyalClassicTemplate';
import { JurnalPesisirTemplate } from '../templates/standard/JurnalPesisirTemplate';
import { LangitPorselenTemplate } from '../templates/standard/LangitPorselenTemplate';
import { LEclipseDamourTemplate } from '../templates/standard/LEclipseDamourTemplate';
import { SimpulSutraTemplate } from '../templates/standard/SimpulSutraTemplate';
import { SerenadeCameliaTemplate } from '../templates/standard/SerenadeCameliaTemplate';
import { GrandPelaminanTemplate } from '../templates/standard/GrandPelaminanTemplate';
import { TimelessBotanicalTemplate } from '../templates/standard/TimelessBotanicalTemplate';
import { VoilierDeSoieTemplate } from '../templates/standard/VoilierDeSoieTemplate';

interface OrderDataFormPageProps {
  initialTemplate?: InvitationItem | null;
  onBackToLanding: () => void;
  onOpenClientPortal?: (invitation?: ClientInvitationData) => void;
}

const ADMIN_PHONE = '6283850714456';
const ORDERABLE_TEMPLATES: InvitationItem[] = STANDARD_TEMPLATES;

const STANDARD_COMPONENTS_MAP: Record<string, React.FC<any>> = {
  'standar-royal-classic': RoyalClassicTemplate,
  'standar-jurnal-pesisir': JurnalPesisirTemplate,
  'standar-langit-porselen': LangitPorselenTemplate,
  'standar-eclipse-amour': LEclipseDamourTemplate,
  'standar-simpul-sutra': SimpulSutraTemplate,
  'standar-serenade-camelia': SerenadeCameliaTemplate,
  'standar-grand-pelaminan': GrandPelaminanTemplate,
  'standar-timeless-botanical': TimelessBotanicalTemplate,
  'standar-voilier-de-soie': VoilierDeSoieTemplate,
};

function formatEventDate(dateValue: string): string {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T08:00:00`);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function buildSlug(brideName: string, groomName: string): string {
  const base = `${brideName || 'mempelai'}-${groomName || 'pasangan'}`;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const OrderDataFormPage: React.FC<OrderDataFormPageProps> = ({
  initialTemplate,
  onBackToLanding,
  onOpenClientPortal,
}) => {
  // Sesi Portal Mempelai yang sudah aktif di perangkat ini (jika ada)
  const [activePortalSession, setActivePortalSession] = useState<{ code: string; pin: string; clientId: string } | null>(null);

  useEffect(() => {
    const session = getPortalSession();
    if (session && session.code && session.pin) {
      setActivePortalSession(session);
    }
  }, []);

  // Default to a standard template
  const defaultTemplate = useMemo(() => {
    if (initialTemplate && STANDARD_TEMPLATES.some((t) => t.id === initialTemplate.id)) {
      return initialTemplate;
    }
    return STANDARD_TEMPLATES[0];
  }, [initialTemplate]);

  const [templateId, setTemplateId] = useState<string>(defaultTemplate.id);
  const [designMode, setDesignMode] = useState<'with_photos' | 'typography_pure'>('with_photos');

  // Data Pemesan & Kredensial Portal Mempelai
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [portalCustomSlug, setPortalCustomSlug] = useState('');
  const [portalPin, setPortalPin] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [referralCode, setReferralCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('ref') || '';
    }
    return '';
  });
  const [brideName, setBrideName] = useState('');
  const [brideFullName, setBrideFullName] = useState('');
  const [brideParents, setBrideParents] = useState('');
  const [groomName, setGroomName] = useState('');
  const [groomFullName, setGroomFullName] = useState('');
  const [groomParents, setGroomParents] = useState('');

  // Acara & Waktu
  const [eventDate, setEventDate] = useState('');
  const [akadTime, setAkadTime] = useState('08.00 – 10.00 WIB');
  const [akadVenue, setAkadVenue] = useState('');
  const [resepsiTime, setResepsiTime] = useState('11.00 – 14.00 WIB');
  const [resepsiVenue, setResepsiVenue] = useState('');
  const [city, setCity] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');

  // Amplop Digital
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [notes, setNotes] = useState('');

  // Musik: 'catalog' (katalog Sekarsiti) | 'custom' (1 slot upload kustom)
  const [musicChoice, setMusicChoice] = useState<'catalog' | 'custom'>('catalog');
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customAudioTitle, setCustomAudioTitle] = useState('');
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);
  const [isPlayingCustomAudio, setIsPlayingCustomAudio] = useState(false);
  const customAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [catalogTracks, setCatalogTracks] = useState<MusicTrack[]>([]);
  const [selectedCatalogTrack, setSelectedCatalogTrack] = useState<MusicTrack | null>(null);
  const [playingCatalogId, setPlayingCatalogId] = useState<string | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Upload Media
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [gdriveLink, setGdriveLink] = useState('');
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Live Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ClientInvitationData | null>(null);

  // Status Submit & Pembayaran Gateway
  const [submittedOrder, setSubmittedOrder] = useState<ClientInvitationData | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaidSettled, setIsPaidSettled] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => ORDERABLE_TEMPLATES.find((item) => item.id === templateId) || ORDERABLE_TEMPLATES[0],
    [templateId]
  );

  const activeTemplateDef = useMemo(
    () => TEMPLATE_REGISTRY[templateId as TemplateId] || TEMPLATE_REGISTRY['standar-royal-classic'] || TEMPLATE_REGISTRY['ruang-rasa'],
    [templateId]
  );

  const formattedPrice = 'Rp49.000';

  // Upload Foto Prewedding langsung ke Cloudinary
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploadingFiles(true);

    const fileList = Array.from(files);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgressText(`Mengunggah foto ${i + 1} dari ${fileList.length}...`);

        if (isCloudinaryConfigured) {
          const cloudUrl = await uploadToCloudinary(file);
          newUrls.push(cloudUrl);
        } else {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newUrls.push(base64);
        }
      }

      setUploadedPhotos((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error('Upload foto gagal:', err);
      setUploadError(err.message || 'Gagal mengunggah foto. Silakan coba lagi.');
    } finally {
      setIsUploadingFiles(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  // Hapus foto prewedding dan picu hapus dari Cloudinary jika ada
  const handleRemovePhoto = (idx: number) => {
    const urlToRemove = uploadedPhotos[idx];
    if (urlToRemove) {
      deleteFromCloudinary(urlToRemove);
    }
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Upload Musik Kustom (1 slot) ke Cloudinary
  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioUploadError(null);
    setIsUploadingAudio(true);

    try {
      // Hapus file lama di Cloudinary jika sudah pernah upload sebelumnya
      if (customAudioUrl) {
        deleteFromCloudinary(customAudioUrl);
      }

      const uploadedUrl = await uploadMusicToCloudinary(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      setCustomAudioUrl(uploadedUrl);
      setCustomAudioTitle(cleanTitle);
      setMusicChoice('custom');
    } catch (err: any) {
      console.error('Upload audio gagal:', err);
      setAudioUploadError(err.message || 'Gagal mengunggah file musik.');
    } finally {
      setIsUploadingAudio(false);
      e.target.value = '';
    }
  };

  const handleRemoveCustomAudio = () => {
    if (customAudioUrl) {
      deleteFromCloudinary(customAudioUrl);
    }
    setCustomAudioUrl('');
    setCustomAudioTitle('');
    setIsPlayingCustomAudio(false);
    customAudioPlayerRef.current?.pause();
  };

  const handleTogglePlayCustomAudio = () => {
    if (!customAudioUrl) return;
    if (isPlayingCustomAudio) {
      customAudioPlayerRef.current?.pause();
      setIsPlayingCustomAudio(false);
    } else {
      if (!customAudioPlayerRef.current) {
        customAudioPlayerRef.current = new Audio(customAudioUrl);
      } else {
        customAudioPlayerRef.current.src = customAudioUrl;
      }
      customAudioPlayerRef.current
        .play()
        .then(() => setIsPlayingCustomAudio(true))
        .catch(() => {});
      customAudioPlayerRef.current.onended = () => setIsPlayingCustomAudio(false);
    }
  };

  // Fetch katalog musik resmi Sekarsiti
  useEffect(() => {
    setIsLoadingCatalog(true);
    fetchMusicTracks()
      .then((data) => {
        setCatalogTracks(data || []);
        if (data && data.length > 0 && !selectedCatalogTrack) {
          setSelectedCatalogTrack(data[0]);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat katalog musik di form:', err);
      })
      .finally(() => {
        setIsLoadingCatalog(false);
      });

    return () => {
      audioPreviewRef.current?.pause();
      audioPreviewRef.current = null;
      customAudioPlayerRef.current?.pause();
      customAudioPlayerRef.current = null;
    };
  }, []);

  const handleTogglePreviewCatalog = (track: MusicTrack) => {
    if (playingCatalogId === track.id) {
      audioPreviewRef.current?.pause();
      setPlayingCatalogId(null);
      return;
    }
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio();
    }
    audioPreviewRef.current.src = track.audio_url;
    audioPreviewRef.current
      .play()
      .then(() => setPlayingCatalogId(track.id))
      .catch(() => {});
    audioPreviewRef.current.onended = () => setPlayingCatalogId(null);
  };

  const handleCopyText = (key: string, text: string) => {
    safeCopyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // BUKA LIVE PREVIEW SEBELUM BAYAR
  const handleOpenLivePreview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('Mohon cantumkan nama pemesan.');
      return;
    }
    if (!clientPhone.trim()) {
      alert('Mohon cantumkan nomor WhatsApp aktif.');
      return;
    }
    if (!brideName.trim() || !groomName.trim()) {
      alert('Mohon cantumkan nama panggilan kedua mempelai.');
      return;
    }
    if (!eventDate) {
      alert('Mohon tentukan tanggal perayaan utama.');
      return;
    }
    if (!city.trim()) {
      alert('Mohon cantumkan kota / wilayah perayaan.');
      return;
    }

    const displayClientName = clientName.trim() || `${brideName.trim()} & ${groomName.trim()}`;
    const eventDateFormatted = formatEventDate(eventDate);
    const countdownIsoDate = eventDate ? `${eventDate}T08:00:00` : `${new Date().toISOString().slice(0, 10)}T08:00:00`;

    const defaultSlug = buildSlug(brideName, groomName);
    const effectiveSlug = (portalCustomSlug.trim() || defaultSlug) || `undangan-${Date.now().toString().slice(-6)}`;
    const cleanPin = (portalPin.trim() || '1234').slice(0, 6);

    const rawMediaCandidate = {
      heroImage: uploadedPhotos[0] || '',
      bridePortrait: uploadedPhotos[1] || '',
      groomPortrait: uploadedPhotos[2] || '',
      galleryImages: uploadedPhotos,
      gdriveFolderUrl: gdriveLink.trim() || undefined,
    };

    const { placedMedia } = smartPlaceAssets(
      rawMediaCandidate,
      templateId as TemplateId,
      uploadedPhotos
    );

    let finalSongTitle = 'Instrumen Pernikahan Romantis';
    let finalAudioUrl = activeTemplateDef?.defaultData?.audioUrl || '';

    if (musicChoice === 'custom' && customAudioUrl) {
      finalSongTitle = customAudioTitle || 'Lagu Pilihan Mempelai';
      finalAudioUrl = customAudioUrl;
    } else if (musicChoice === 'catalog' && selectedCatalogTrack) {
      finalSongTitle = `${selectedCatalogTrack.title} - ${selectedCatalogTrack.artist}`;
      finalAudioUrl = selectedCatalogTrack.audio_url;
    }

    const compiledData: ClientInvitationData = {
      id: `draft-${Date.now()}`,
      clientName: displayClientName,
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      templateId: templateId as TemplateId,
      status: 'published', // set published agar seluruh fitur template tampil di live preview
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quoteText: 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.',
      quoteSource: 'QS. Ar-Rum: 21',
      packageTier: 'standar',
      designMode,
      paymentStatus: 'unpaid',
      slug: effectiveSlug,
      accessCode: effectiveSlug,
      pinCode: cleanPin,
      brideName: brideName.trim(),
      brideFullName: brideFullName.trim() || brideName.trim(),
      brideParents: brideParents.trim(),
      groomName: groomName.trim(),
      groomFullName: groomFullName.trim() || groomName.trim(),
      groomParents: groomParents.trim(),
      eventDateFormatted,
      countdownIsoDate,
      akadTime: akadTime.trim(),
      akadVenue: akadVenue.trim() || resepsiVenue.trim(),
      resepsiTime: resepsiTime.trim(),
      resepsiVenue: resepsiVenue.trim(),
      city: city.trim(),
      mapsUrl: mapsUrl.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      referralCode: referralCode.trim().toUpperCase() || undefined,
      songTitle: finalSongTitle,
      audioUrl: finalAudioUrl,
      mediaSlots: {
        ...placedMedia,
        heroImage: placedMedia.heroImage || uploadedPhotos[0] || '',
        bridePortrait: placedMedia.bridePortrait || uploadedPhotos[1] || '',
        groomPortrait: placedMedia.groomPortrait || uploadedPhotos[2] || '',
        galleryImages: placedMedia.galleryImages?.length > 0 ? placedMedia.galleryImages : uploadedPhotos,
      },
    };

    setPreviewData(compiledData);
    setIsPreviewOpen(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // LANJUT BAYAR DARI DALAM LIVE PREVIEW
  const handleProceedToPayment = async (dataToPay: ClientInvitationData) => {
    setIsProcessingPayment(true);

    const newOrder = AdminStore.create({
      ...dataToPay,
      status: 'pending',
    });

    try {
      await triggerMidtransCheckout(
        {
          orderId: newOrder.id,
          grossAmount: 49000,
          clientName: newOrder.clientName,
          clientEmail: newOrder.clientEmail || undefined,
          clientPhone: newOrder.clientPhone || undefined,
          templateTitle: `Seri Standar - ${selectedTemplate.title}`,
        },
        {
          onSuccess: (_result) => {
            const paidOrder = AdminStore.markAsPaidAndPublished(newOrder.id);
            // Simpan sesi portal mempelai seketika ke localStorage
            savePortalSession(paidOrder.accessCode || paidOrder.slug, paidOrder.pinCode || '7429', paidOrder.id);
            setSubmittedOrder(paidOrder);
            setIsPaidSettled(true);
            setIsPreviewOpen(false);
            setIsProcessingPayment(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
          },
          onPending: (_result) => {
            setIsProcessingPayment(false);
          },
          onError: (err) => {
            console.error('Midtrans payment error:', err);
            setIsProcessingPayment(false);
            alert('Pembayaran belum berhasil atau dibatalkan. Silakan coba kembali.');
          },
          onClose: () => {
            setIsProcessingPayment(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Midtrans checkout error:', err);
      setIsProcessingPayment(false);
      alert('Tidak dapat memproses gateway pembayaran: ' + (err.message || 'Coba lagi.'));
    }
  };

  // Selected Template Component for Live Preview
  const SelectedTemplateComponent = STANDARD_COMPONENTS_MAP[templateId] || RoyalClassicTemplate;

  // 1. TAMPILAN FULLSCREEN LIVE PREVIEW (SEBELUM BAYAR)
  if (isPreviewOpen && previewData) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex flex-col h-screen w-screen overflow-hidden">
        {/* Top Floating Control Bar */}
        <header className="bg-[#181816] text-[#FAF8F5] px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between gap-3 shadow-xl shrink-0 z-50">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ubah Data Formulir</span>
            </button>
            <div className="truncate hidden sm:block">
              <p className="text-xs font-bold leading-tight truncate">
                Pratinjau: {previewData.brideName} &amp; {previewData.groomName}
              </p>
              <p className="text-[10px] text-stone-400 truncate">
                {selectedTemplate.title} &middot; Seri Standar Rp49.000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-block text-[11px] text-emerald-400 font-medium">
              ✓ Cek tampilan undangan Anda di bawah ini
            </span>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleProceedToPayment(previewData)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#C5A880] hover:bg-[#d4b993] text-[#181816] text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#181816]" />
                  <span>Menyiapkan Pembayaran...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#181816]" />
                  <span>Lanjut Bayar &amp; Aktifkan (Rp49.000)</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Live Template Frame */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-[#EDE9E0]">
          <SelectedTemplateComponent
            customData={previewData}
            onBackToLanding={() => setIsPreviewOpen(false)}
          />
        </div>
      </div>
    );
  }

  // 3. FORMULIR PEMESANAN RESMI (SERI STANDAR)
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2E28] flex flex-col justify-between selection:bg-[#E8E5DF]">
      <header className="border-b border-[#EBE6DD] bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#414A35] hover:text-[#2C2E28] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
          <span className="font-['Fraunces',serif] text-base text-[#414A35] font-semibold">sekarsiti</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-12 flex-1">
        <div className="space-y-8">
          {/* Header Banner & User Badge */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#7A8B74] block">
                Formulir Pemesanan Mandiri &middot; Seri Standar Rp49.000
              </span>
              <div className="flex items-center gap-2">
                {activePortalSession ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Sesi Portal: <strong className="font-mono">{activePortalSession.code}</strong></span>
                    <button
                      type="button"
                      onClick={() => onOpenClientPortal ? onOpenClientPortal() : (window.location.href = `/?portal=${encodeURIComponent(activePortalSession.code)}&pin=${encodeURIComponent(activePortalSession.pin)}`)}
                      className="text-[#414A35] font-bold underline ml-1 cursor-pointer hover:text-black"
                    >
                      Buka Portal Mempelai →
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenClientPortal ? onOpenClientPortal() : (window.location.href = '/?view=portal')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] text-amber-900 font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Sudah punya undangan? Masuk Portal Mempelai</span>
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2C2E28]">
              Lengkapi Data Undangan Anda
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
              Isi data acara pernikahan Anda di bawah ini. Setelah selesai, Anda dapat langsung melihat <strong>Pratinjau Nyata (Live Preview)</strong> hasil undangan sebelum melakukan pembayaran otomatis.
            </p>
          </div>

          {/* Success & Celebration Banner */}
          {submittedOrder && (
            <div className="p-5 sm:p-6 rounded-2xl border space-y-4 shadow-sm bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-50 border-emerald-300 text-emerald-950">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base">
                    Pembayaran Terverifikasi &amp; Undangan Aktif Seketika! 🎉
                  </h3>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    Selamat! Undangan digital Anda ({submittedOrder.clientName}) kini telah resmi aktif dan siap disebarkan ke para tamu.
                  </p>
                </div>
              </div>

              {/* Tautan Undangan & Kredensial Portal Mempelai */}
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-stone-200/80 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                    Tautan Publik Undangan Anda:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : 'https://ssiti.tech'}/?client=${submittedOrder.slug || submittedOrder.id}`}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-800"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          'inv-link',
                          `${typeof window !== 'undefined' ? window.location.origin : 'https://ssiti.tech'}/?client=${submittedOrder.slug || submittedOrder.id}`
                        )
                      }
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    >
                      {copiedKey === 'inv-link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'inv-link' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                    <a
                      href={`/?client=${encodeURIComponent(submittedOrder.slug || submittedOrder.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#414A35] hover:bg-[#343B2A] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Undangan</span>
                    </a>
                  </div>
                </div>

                {/* Info Login Portal Mempelai */}
                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#93754F] block">
                      Akses Portal Mempelai (Kelola Data &amp; Tamu):
                    </span>
                    <p className="text-xs text-stone-700">
                      Kode Akses: <strong className="font-mono">{submittedOrder.accessCode || submittedOrder.slug}</strong> &middot; PIN:{' '}
                      <strong className="font-mono">{submittedOrder.pinCode}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenClientPortal) {
                        onOpenClientPortal(submittedOrder);
                      } else {
                        window.location.href = `/?portal=${encodeURIComponent(submittedOrder.accessCode || submittedOrder.slug)}&pin=${encodeURIComponent(submittedOrder.pinCode || '')}`;
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-[#F7F5EF] rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Masuk ke Portal Mempelai Sekarang →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleOpenLivePreview} className="space-y-6">
            {/* STEP 1: PILIH TEMA DESAIN SERI STANDAR */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#F2EFE8] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                  <h2 className="text-sm font-bold text-[#2C2E28]">1. Pilihan Desain Tema Seri Standar</h2>
                </div>
                <span className="text-xs font-bold text-[#414A35] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Investasi: Rp49.000
                </span>
              </div>

              {/* 1A: PILIH TEMPLATE DARI 9 SERI STANDAR */}
              <div>
                <label className="block text-xs font-semibold text-[#414A35] mb-2">
                  Pilih Tema Desain (9 Pilihan Tersedia)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ORDERABLE_TEMPLATES.map((item) => {
                    const isSelected = templateId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setTemplateId(item.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#414A35] bg-[#F7F5EF] shadow-xs ring-2 ring-[#414A35]/15'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-2 bg-stone-100 relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#414A35] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Terpilih ✓
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-xs text-[#2C2E28] truncate">{item.title}</p>
                            <p className="text-[10px] text-stone-500 truncate">{item.styleLabel}</p>
                          </div>
                          <span className="text-[11px] font-bold text-[#414A35] shrink-0">
                            Rp49.000
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1B: PILIHAN MODE VISUAL (DENGAN FOTO VS TANPA FOTO) */}
              <div>
                <label className="block text-xs font-semibold text-[#414A35] mb-2">
                  Mode Visual &amp; Dokumentasi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDesignMode('with_photos')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      designMode === 'with_photos'
                        ? 'border-[#414A35] bg-[#FAF8F3] shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <ImageIcon className={`w-5 h-5 shrink-0 mt-0.5 ${designMode === 'with_photos' ? 'text-[#414A35]' : 'text-stone-400'}`} />
                    <div>
                      <p className="font-bold text-xs text-stone-900">Dengan Foto Prewedding</p>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                        Menampilkan potret mempelai di sampul utama, profil kedua mempelai, dan galeri momen bahagia.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setDesignMode('typography_pure')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      designMode === 'typography_pure'
                        ? 'border-[#414A35] bg-[#FAF8F3] shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${designMode === 'typography_pure' ? 'text-[#C5A880]' : 'text-stone-400'}`} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-stone-900">Mode Tipografi &amp; Ornamen Klasik</p>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                        Solusi anggun <strong>tanpa foto prewedding</strong>. Didesain dengan monogram inisial artistik, ornamen klasik, dan fokus pada doa serta kata-kata bermakna.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: DATA PEMESAN & KREDENSIAL PORTAL MEMPELAI */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <Heart className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">2. Data Pemesan &amp; Kredensial Portal Mempelai</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Nama Pemesan / Kedua Mempelai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: Kirana & Adhitya"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Digunakan untuk konfirmasi pesanan &amp; pemulihan akses.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Untuk bukti pembayaran resmi Midtrans.</p>
                </div>
              </div>

              {/* Bagian Kredensial Portal Mempelai (Slug & PIN 4-digit) */}
              <div className="p-4 bg-[#FAF8F5] border border-[#EBE6DD] rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="text-xs font-bold text-[#414A35] uppercase tracking-wider">
                    Kunci Akses Portal Mempelai Anda
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Informasi di bawah ini adalah tautan publik undangan dan PIN rahasia untuk masuk ke <strong>Portal Mempelai</strong> Anda kapan saja (untuk mengedit data, mengganti foto/musik, mengelola buku tamu, dan RSVP).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Tautan Publik Undangan (Kode Akses)
                    </label>
                    <div className="flex items-center">
                      <span className="text-[11px] text-stone-400 bg-stone-100 border border-r-0 border-stone-200 px-2 py-2 rounded-l-lg font-mono">
                        ssiti.tech/?client=
                      </span>
                      <input
                        type="text"
                        value={portalCustomSlug}
                        onChange={(e) => setPortalCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder={buildSlug(brideName, groomName) || 'nama-mempelai'}
                        className="w-full text-xs p-2 rounded-r-lg border border-stone-200 bg-white font-mono focus:outline-none focus:border-[#414A35]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-stone-700">
                        PIN Sandi Portal (4 Digit) <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setPortalPin(String(Math.floor(1000 + Math.random() * 9000)))}
                        className="text-[10px] text-[#8C6D3F] hover:underline font-medium cursor-pointer"
                      >
                        Acak PIN Baru ⟳
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={portalPin}
                      onChange={(e) => setPortalPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="4 Digit PIN (contoh: 7429)"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white font-mono tracking-widest text-center focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Kode Referral / Partner Reseller (Opsional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: DINA20 (Kosongkan jika tidak ada)"
                    className="w-full text-xs p-2 rounded-lg border border-[#EBE6DD] bg-white font-mono uppercase focus:outline-none focus:border-[#414A35]"
                  />
                  {referralCode && (
                    <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                      ✓ Pesanan ini tercatat dengan referral: <strong>{referralCode}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 3: PROFIL KEDUA MEMPELAI */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-bold text-[#2C2E28]">3. Profil Kedua Mempelai</h2>
              </div>

              {/* Mempelai Wanita */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200/80 space-y-3">
                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Mempelai Wanita (The Bride)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Panggilan Wanita <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      placeholder="Contoh: Kirana"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Lengkap &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={brideFullName}
                      onChange={(e) => setBrideFullName(e.target.value)}
                      placeholder="Contoh: Kirana Ayu Lestari, S.Ds."
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nama Orang Tua Mempelai Wanita
                  </label>
                  <input
                    type="text"
                    value={brideParents}
                    onChange={(e) => setBrideParents(e.target.value)}
                    placeholder="Contoh: Putri pertama dari Bapak Hendra Wijaya & Ibu Sinta Maharani"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
              </div>

              {/* Mempelai Pria */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200/80 space-y-3">
                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Mempelai Pria (The Groom)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Panggilan Pria <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      placeholder="Contoh: Adhitya"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Lengkap &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={groomFullName}
                      onChange={(e) => setGroomFullName(e.target.value)}
                      placeholder="Contoh: Adhitya Nugraha, B.Eng."
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nama Orang Tua Mempelai Pria
                  </label>
                  <input
                    type="text"
                    value={groomParents}
                    onChange={(e) => setGroomParents(e.target.value)}
                    placeholder="Contoh: Putra kedua dari Bapak Suryanto Nugraha & Ibu Ratna Dewi"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
              </div>
            </div>

            {/* STEP 4: WAKTU & LOKASI ACARA */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">4. Waktu &amp; Lokasi Rangkaian Acara</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Tanggal Perayaan Utama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Kota / Wilayah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan / Denpasar"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
              </div>

              {/* Akad & Resepsi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <span className="text-xs font-bold text-stone-800 block">Akad Nikah / Pemberkatan</span>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Waktu Akad</label>
                    <input
                      type="text"
                      value={akadTime}
                      onChange={(e) => setAkadTime(e.target.value)}
                      placeholder="08.00 – 10.00 WIB"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Tempat / Gedung Akad</label>
                    <input
                      type="text"
                      value={akadVenue}
                      onChange={(e) => setAkadVenue(e.target.value)}
                      placeholder="Nama masjid / aula akad"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <span className="text-xs font-bold text-stone-800 block">Resepsi Pernikahan</span>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Waktu Resepsi</label>
                    <input
                      type="text"
                      value={resepsiTime}
                      onChange={(e) => setResepsiTime(e.target.value)}
                      placeholder="11.00 – 14.00 WIB"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Tempat / Gedung Resepsi</label>
                    <input
                      type="text"
                      value={resepsiVenue}
                      onChange={(e) => setResepsiVenue(e.target.value)}
                      placeholder="Nama ballroom / venue resepsi"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414A35] mb-1">
                  Tautan Google Maps Lokasi (Opsional)
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>

            {/* STEP 5: UNGGAH FOTO & MEDIA */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <ImageIcon className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">5. Unggah Foto &amp; Media Dokumentasi</h2>
              </div>

              {designMode === 'typography_pure' ? (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mode Tipografi &amp; Ornamen Klasik Aktif</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    Anda memilih mode tanpa foto prewedding. Undangan Anda akan otomatis didesain dengan monogram inisial anggun dan ornamen floral artistik. Unggah foto di bawah bersifat <strong>sepenuhnya opsional</strong> (boleh dikosongkan atau diisi 1-2 foto cincin/arsitektur jika ada).
                  </p>
                </div>
              ) : (
                <p className="text-xs text-stone-600">
                  Unggah foto prewedding atau momen terbaik Anda (bebas jumlah). Foto yang diunggah akan otomatis dipetakan secara cerdas ke sampul utama, potret mempelai, dan galeri momen.
                </p>
              )}

              {/* File Uploader */}
              <div className="space-y-3">
                <div className="border-2 border-dashed border-[#EBE6DD] hover:border-[#414A35] rounded-xl p-6 text-center transition-colors bg-[#FAF8F5] relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingFiles}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <Upload className="w-8 h-8 text-[#414A35] mx-auto opacity-70" />
                    <p className="text-xs font-semibold text-[#2C2E28]">
                      {isUploadingFiles ? uploadProgressText : 'Pilih atau Seret Foto ke Sini'}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Mendukung format JPG, PNG, WebP. Foto dikompresi otomatis tanpa pecah.
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 font-medium">⚠️ {uploadError}</p>
                )}

                {/* Preview Thumbnail Grid */}
                {uploadedPhotos.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-semibold text-stone-600 block">
                      Foto Terunggah ({uploadedPhotos.length} foto):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {uploadedPhotos.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-stone-200 bg-stone-100">
                          <img
                            src={url}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                            title="Hapus foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opsi Tautan Google Drive */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Atau Cantumkan Tautan Google Drive (Jika foto berukuran sangat besar)
                  </label>
                  <input
                    type="url"
                    value={gdriveLink}
                    onChange={(e) => setGdriveLink(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full text-xs p-2 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
              </div>
            </div>

            {/* STEP 6: AMPLOP DIGITAL & MUSIK PENGIRING */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <CreditCard className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">6. Rekening Amplop Digital &amp; Musik Pengiring</h2>
              </div>

              {/* Amplop Digital */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#414A35] uppercase tracking-wider">
                  Rekening Amplop Digital (Hadiah Pernikahan)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Nama Bank / e-Wallet</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="BCA / Mandiri / GoPay"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Nomor Rekening / HP</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Contoh: 1234567890"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Nama Pemilik Rekening</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Nama di buku rekening"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Musik Pengiring Undangan (1 Slot Custom Audio vs Katalog Sekarsiti) */}
              <div className="space-y-3 pt-3 border-t border-[#F2EFE8]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-[#C5A880]" />
                    <label className="text-xs font-bold text-[#414A35] uppercase tracking-wider">
                      Musik Pengiring Undangan (1 Slot)
                    </label>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">Bisa diganti kapan saja di Portal</span>
                </div>

                {/* 2 Pilihan Sumber Musik: Upload Musik Kustom Sendiri vs Katalog */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Opsi 1: Upload Musik Kustom Sendiri */}
                  <div
                    onClick={() => setMusicChoice('custom')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      musicChoice === 'custom'
                        ? 'border-[#414A35] bg-[#FAF8F3] shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#2C2E28]">1. Upload Musik Kustom Sendiri</span>
                      {musicChoice === 'custom' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Unggah file lagu romantis pilihan Anda (.mp3 / .wav / .m4a). Maksimal 1 file.
                    </p>
                  </div>

                  {/* Opsi 2: Pilih dari Katalog Resmi Sekarsiti */}
                  <div
                    onClick={() => setMusicChoice('catalog')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      musicChoice === 'catalog'
                        ? 'border-[#414A35] bg-[#FAF8F3] shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#2C2E28]">2. Pilih dari Katalog Sekarsiti</span>
                      {musicChoice === 'catalog' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Pilihan instrumen piano &amp; biola romantis bebas royalti siap pakai.
                    </p>
                  </div>
                </div>

                {/* AREA TAMPILAN SESUAI SUMBER MUSIK */}
                {musicChoice === 'custom' ? (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <span className="text-xs font-semibold text-stone-800 block">
                      Slot File Musik Kustom (1 File Audio):
                    </span>

                    {!customAudioUrl ? (
                      <div className="border-2 border-dashed border-stone-300 hover:border-[#414A35] rounded-xl p-5 text-center bg-white transition-colors relative">
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.m4a"
                          onChange={handleCustomAudioUpload}
                          disabled={isUploadingAudio}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="space-y-1.5 pointer-events-none">
                          <Music className="w-6 h-6 text-[#414A35] mx-auto opacity-70" />
                          <p className="text-xs font-semibold text-stone-800">
                            {isUploadingAudio ? 'Mengunggah file audio ke cloud...' : 'Klik untuk Pilih File Musik (.mp3, .wav, .m4a)'}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            Maksimal 10 MB &middot; Otomatis diputar lembut saat undangan dibuka
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white border border-[#414A35] rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={handleTogglePlayCustomAudio}
                            className="p-2 rounded-full bg-[#414A35] text-white hover:bg-[#343B2A] transition-colors cursor-pointer shrink-0"
                            title={isPlayingCustomAudio ? 'Jeda preview' : 'Putar preview'}
                          >
                            {isPlayingCustomAudio ? <Pause className="w-4 h-4 text-[#C5A880]" /> : <Play className="w-4 h-4" />}
                          </button>
                          <div className="truncate">
                            <p className="text-xs font-bold text-stone-900 truncate">
                              {customAudioTitle || 'File Musik Kustom Anda'}
                            </p>
                            <span className="text-[10px] text-emerald-700 font-medium">✓ Terunggah &amp; Siap Diputar</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleRemoveCustomAudio}
                            className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Hapus / Ganti Musik"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {audioUploadError && (
                      <p className="text-xs text-red-600 font-medium">⚠️ {audioUploadError}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <span className="text-xs font-semibold text-stone-800 block">
                      Pilih dari Katalog Resmi:
                    </span>

                    {isLoadingCatalog ? (
                      <div className="py-4 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#414A35]" />
                        <span>Memuat katalog musik Sekarsiti...</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {catalogTracks.map((track) => {
                          const isSelected = selectedCatalogTrack?.id === track.id;
                          const isPlaying = playingCatalogId === track.id;
                          return (
                            <div
                              key={track.id}
                              className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-xs transition-colors ${
                                isSelected
                                  ? 'border-[#414A35] bg-[#F7F5EF]'
                                  : 'border-stone-100 hover:bg-stone-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePreviewCatalog(track)}
                                  className="p-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-black cursor-pointer shrink-0 shadow-2xs"
                                  title="Dengar preview musik"
                                >
                                  {isPlaying ? (
                                    <Pause className="w-3.5 h-3.5 text-[#C5A880]" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <div className="truncate">
                                  <p className="font-semibold text-stone-900 truncate text-[11px]">
                                    {track.title}
                                  </p>
                                  <p className="text-[10px] text-stone-500 truncate">
                                    {track.artist}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedCatalogTrack(track)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
                                  isSelected
                                    ? 'bg-[#414A35] text-white'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}
                              >
                                {isSelected ? 'Terpilih ✓' : 'Pilih Lagu'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Catatan Tambahan untuk Undangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Dresscode warna sage green, mohon sertakan petunjuk parkir..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions: LIHAT PRATINJAU UNDANGAN */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F2EFE8]">
              <div>
                <span className="text-xs text-stone-500 block">Total Investasi Seri Standar:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[#414A35]">
                    {formattedPrice}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    (Paket Standar Instan &middot; {designMode === 'typography_pure' ? 'Mode Tipografi' : 'Dengan Foto'})
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="submit"
                  disabled={isUploadingFiles || isUploadingAudio}
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-8 bg-[#414A35] hover:bg-[#343B2A] disabled:opacity-50 text-[#F7F5EF] rounded-full text-sm font-bold transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <Eye className="w-4 h-4 text-[#C5A880]" />
                  <span>Lihat Pratinjau Undangan (Live Preview) &rarr;</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Chat Link */}
          <div className="text-center pt-2">
            <a
              href={`https://wa.me/${ADMIN_PHONE}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#414A35] hover:text-[#2C2E28] hover:underline"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Butuh bantuan atau ingin konsultasi via WhatsApp? Klik di sini</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
