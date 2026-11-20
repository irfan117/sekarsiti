import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Disc3,
  Disc,
  Copy,
  Check,
  Heart,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import {
  useCountdown,
  useGuestRecipient,
  useAudioController,
  useClipboardCopy,
  useGuestbook,
  useRsvpForm
} from '../../hooks/useInvitationCore';
import {
  InteractiveWaxSeal3D,
  GoldDustCanvas,
  BotanicalCornerFlourish,
  BotanicalVineDivider,
  OliveBranchSprig,
  KineticTextReveal
} from '../../components/ornaments';

interface StandardTemplateProps {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
  themeStyle?: 'monochrome' | 'botanical' | 'terracotta';
}

export const StandardEssentialTemplate: React.FC<StandardTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
  themeStyle,
}) => {
  const themeFromInvitation = customData?.templateId === 'standar-botanika'
    ? 'botanical'
    : customData?.templateId === 'standar-kalatidha' ? 'terracotta' : 'monochrome';
  const activeTheme = themeStyle || themeFromInvitation;
  const sample = activeTheme === 'botanical'
    ? {
        bride: 'Alya Nirmala', groom: 'Damar Prabowo', date: 'Minggu, 18 Oktober 2026',
        iso: '2026-10-18T09:00:00+07:00', akad: 'Masjid Agung Al-Furqon', venue: 'Plataran Dharmawangsa',
        city: 'Jakarta Selatan', bank: 'Mandiri', account: '1370 0192 8847', holder: 'Damar Prabowo',
        quote: 'Menemukan ketenangan dalam tatap, melangkah bersama dalam doa dan ketulusan.', source: 'Janji di bawah ranting zaitun',
        song: 'Kisah Romantis - Acoustic Piano',
      }
    : activeTheme === 'terracotta'
      ? {
          bride: 'Nirmala Laksita', groom: 'Bagas Wicaksono', date: 'Sabtu, 24 Oktober 2026',
          iso: '2026-10-24T09:00:00+07:00', akad: 'Sasana Budaya Ganesha', venue: 'Sasana Budaya Ganesha',
          city: 'Bandung', bank: 'BSI', account: '7182 9901 234', holder: 'Nirmala Laksita',
          quote: 'Membangun ikrar suci dalam naungan cinta, kebaikan, dan restu keluarga tercinta.', source: 'Ikrar dalam lengkung waktu',
          song: 'Senja Menyapa - String Ensemble',
        }
      : {
          bride: 'Azalia Fasya', groom: 'Dias Taufik', date: 'Sabtu, 14 November 2026',
          iso: '2026-11-14T08:00:00+07:00', akad: 'Masjid Agung Al-Furqon', venue: 'Gedung Sasana Budaya',
          city: 'Bandung', bank: 'BCA', account: '1234 5678 9012', holder: 'Azalia Fasya',
          quote: '“Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.”', source: 'QS. Ar-Rum : 21',
          song: 'Until I Found You - Acoustic Strings',
        };
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isCoverDismissed, setIsCoverDismissed] = useState(false);
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);

  // Data Mempelai
  const brideName = customData?.brideName || sample.bride.split(' ')[0];
  const brideFullName = customData?.brideFullName || sample.bride;
  const brideParents = customData?.brideParents || 'Putri tercinta dari keluarga';
  const brideInstagram = customData?.brideInstagram || '';

  const groomName = customData?.groomName || sample.groom.split(' ')[0];
  const groomFullName = customData?.groomFullName || sample.groom;
  const groomParents = customData?.groomParents || 'Putra tercinta dari keluarga';
  const groomInstagram = customData?.groomInstagram || '';

  const eventDateFormatted = customData?.eventDateFormatted || sample.date;
  const countdownIsoDate = customData?.countdownIsoDate || sample.iso;
  const akadTime = customData?.akadTime || '08.00 – 10.00 WIB';
  const akadVenue = customData?.akadVenue || sample.akad;
  const resepsiTime = customData?.resepsiTime || '11.00 – 14.00 WIB';
  const resepsiVenue = customData?.resepsiVenue || sample.venue;
  const city = customData?.city || sample.city;
  const mapsUrl = customData?.mapsUrl || 'https://maps.google.com';

  const quoteText =
    customData?.quoteText ||
    sample.quote;
  const quoteSource = customData?.quoteSource || sample.source;

  const bankName = customData?.bankName || sample.bank;
  const accountNumber = customData?.accountNumber || sample.account;
  const accountHolder = customData?.accountHolder || sample.holder;
  const secondaryBankName = customData?.secondaryBankName;
  const secondaryAccountNumber = customData?.secondaryAccountNumber;
  const secondaryAccountHolder = customData?.secondaryAccountHolder;

  const songTitle = customData?.songTitle || sample.song;
  const audioUrl = customData?.audioUrl || '';

  // Core Hooks
  const { guestName, hideGuestName } = useGuestRecipient('Nama Tamu Undangan');
  const { days, hours, mins, secs } = useCountdown(countdownIsoDate);
  const { isPlayingAudio, toggleAudio, showAudioToast } = useAudioController(songTitle, audioUrl);
  const { copyText, isCopied } = useClipboardCopy(2000);

  // Live Guestbook & RSVP
  const defaultInitialWishes = useMemo(
    () => [
      {
        name: 'Rina Putri',
        message: 'Selamat berbahagia, semoga senantiasa rukun dan langgeng hingga akhir hayat.',
        time: '2 jam lalu',
      },
      {
        name: 'Bima Adi',
        message: 'Barakallahu lakuma wa baraka alaika, semoga menjadi keluarga yang sakinah mawaddah warahmah.',
        time: '5 jam lalu',
      },
    ],
    []
  );

  const [toastText, setToastText] = useState('');
  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(''), 2200);
  };

  const {
    wishes: guestbookEntries,
    nameInput: wishName,
    setNameInput: setWishName,
    messageInput: wishMessage,
    setMessageInput: setWishMessage,
    submitWish,
  } = useGuestbook(defaultInitialWishes, customData?.id);

  const {
    rsvpName,
    setRsvpName,
    attendance: rsvpAttendance,
    setAttendance: setRsvpAttendance,
    guestCount: rsvpGuestCount,
    setGuestCount: setRsvpGuestCount,
    submitRsvp,
  } = useRsvpForm(() => {
    showToast('Konfirmasi kehadiran tercatat');
  }, customData?.id);

  // Monogram & Initials
  const brideInitial = (brideName.trim().charAt(0) || 'A').toUpperCase();
  const groomInitial = (groomName.trim().charAt(0) || 'D').toUpperCase();
  const monogram = `${brideInitial}&${groomInitial}`;

  const eventYear = useMemo(() => {
    const parsed = new Date(countdownIsoDate);
    if (!isNaN(parsed.getTime())) return parsed.getFullYear();
    const match = eventDateFormatted.match(/\b(20\d{2})\b/);
    if (match) return parseInt(match[1], 10);
    return 2026;
  }, [countdownIsoDate, eventDateFormatted]);

  // Mode Tanpa Foto
  const isPureTypography =
    customData?.designMode === 'typography_pure' ||
    !customData?.mediaSlots?.heroImage;

  const heroImage = customData?.mediaSlots?.heroImage;
  const groomPhoto = customData?.mediaSlots?.groomPortrait;
  const bridePhoto = customData?.mediaSlots?.bridePortrait;

  const handleOpenInvitation = () => {
    setIsCoverOpen(true);
    if (!isPlayingAudio) {
      toggleAudio();
    }
    setTimeout(() => {
      setIsCoverDismissed(true);
    }, 1000);
  };

  const handleCopyAccount = () => {
    copyText(accountNumber.replace(/\s+/g, ''), 'account');
    showToast('Nomor rekening berhasil disalin');
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      showToast('Mohon isi nama lengkap');
      return;
    }
    try {
      await submitRsvp(e);
      if (wishMessage.trim()) {
        setWishName(rsvpName.trim());
        await submitWish();
      }
      showToast('Konfirmasi berhasil dikirim');
    } catch {
      showToast('Konfirmasi tercatat');
    }
  };

  return (
    <div data-standard-theme={activeTheme} className="standard-essential min-h-screen bg-[#0D0D0D] text-[#F8F6F0] font-sans selection:bg-[#C5A880]/30 selection:text-white relative">
      <style>{`
        .standard-essential { --standard-accent: #C5A880; --standard-ink: #F8F6F0; --standard-muted: #A1A1AA; }
        .standard-essential main { max-width: 1120px; padding-inline: clamp(1.25rem, 5vw, 4.5rem); }
        .standard-essential main > section { position: relative; }
        .standard-essential main > section:not(:first-child)::before { content: ''; display: block; width: 3.5rem; height: 1px; margin: 0 auto 2.5rem; background: linear-gradient(90deg, transparent, var(--standard-accent), transparent); opacity: .7; }
        .standard-essential main > section:first-child { min-height: min(780px, 86svh); display: flex; flex-direction: column; justify-content: center; border: 1px solid color-mix(in srgb, var(--standard-accent) 28%, transparent); border-radius: 2rem; padding: clamp(2.25rem, 6vw, 5rem) 1.5rem; overflow: hidden; background: radial-gradient(ellipse at 50% 45%, color-mix(in srgb, var(--standard-accent) 11%, transparent), transparent 54%); }
        .standard-essential main > section:first-child::after { content: ''; position: absolute; inset: 1rem; border: 1px solid color-mix(in srgb, var(--standard-accent) 13%, transparent); border-radius: 1.5rem; pointer-events: none; }
        .standard-essential main > section:nth-child(3) { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: clamp(1rem, 3vw, 2.75rem); }
        .standard-essential main > section:nth-child(3) > *, .standard-essential main > section:nth-child(4) > *, .standard-essential main > section:nth-child(6) > * { margin-top: 0 !important; }
        .standard-essential main > section:nth-child(3) > div { padding: clamp(1rem, 3vw, 2rem); border: 1px solid color-mix(in srgb, var(--standard-accent) 22%, transparent); border-radius: 1.5rem; background: color-mix(in srgb, var(--standard-accent) 4%, transparent); }
        .standard-essential main > section:nth-child(3) > div > div:first-child { width: clamp(7rem, 15vw, 12rem); height: clamp(7rem, 15vw, 12rem); margin-left: auto; margin-right: auto; border-radius: 48% 48% 1.25rem 1.25rem; }
        .standard-essential main > section:nth-child(3) img { filter: saturate(.78) contrast(1.04); }
        .standard-essential main > section:nth-child(4) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: 1rem; }
        .standard-essential main > section:nth-child(4) > div:not(:first-child):not(:last-child) { min-height: 15rem; display: flex; flex-direction: column; justify-content: center; padding: clamp(1.5rem, 3vw, 2.25rem); border-radius: 1.5rem; background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.012)); }
        .standard-essential main > section:nth-child(4) > div:first-child, .standard-essential main > section:nth-child(4) > div:last-child { grid-column: 1 / -1; }
        .standard-essential main > section:nth-child(6) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
        .standard-essential main > section:nth-child(6) > div:first-child { grid-column: 1 / -1; }
        .standard-essential main > section:nth-child(6) > form { grid-column: 1; align-self: start; }
        .standard-essential main > section:nth-child(6) > div:last-child { grid-column: 2; max-height: 28rem; overflow: auto; }
        .standard-essential[data-standard-theme="botanical"] { --standard-accent: #78886A; --standard-ink: #26362D; --standard-muted: #657166; background: #F4F1E8 !important; color: #26362D !important; background-image: radial-gradient(rgba(79, 99, 75, .10) .7px, transparent .7px); background-size: 8px 8px; }
        .standard-essential[data-standard-theme="botanical"] main > section:first-child { background: radial-gradient(ellipse at 50% 70%, rgba(120, 136, 106, .14), transparent 55%), linear-gradient(180deg, rgba(255,255,255,.52), rgba(236, 237, 224, .65)); }
        .standard-essential[data-standard-theme="botanical"] main > section:nth-child(3) > div { background: rgba(255, 254, 250, .72); box-shadow: 0 18px 60px rgba(46, 65, 49, .08); }
        .standard-essential[data-standard-theme="botanical"] > section.fixed { background: #344438 !important; color: #F7F3E9 !important; }
        .standard-essential[data-standard-theme="botanical"] > section.fixed [class*="text-[#F8F6F0]"], .standard-essential[data-standard-theme="botanical"] > section.fixed [class*="text-white"] { color: #F7F3E9 !important; }
        .standard-essential[data-standard-theme="botanical"] > section.fixed [class*="text-[#C5A880]"] { color: #D5C5A0 !important; }
        .standard-essential[data-standard-theme="botanical"] > button.fixed { background: rgba(52, 68, 56, .94) !important; border-color: rgba(213, 197, 160, .42) !important; }
        .standard-essential[data-standard-theme="botanical"] main { color: #26362D !important; }
        .standard-essential[data-standard-theme="botanical"] main [class*="text-[#F8F6F0]"], .standard-essential[data-standard-theme="botanical"] main [class*="text-white"] { color: #26362D !important; }
        .standard-essential[data-standard-theme="botanical"] main [class*="text-zinc-"] { color: #657166 !important; }
        .standard-essential[data-standard-theme="botanical"] main [class*="text-[#C5A880]"] { color: #78886A !important; }
        .standard-essential[data-standard-theme="botanical"] main [class*="border-white"] { border-color: rgba(73, 95, 73, .22) !important; }
        .standard-essential[data-standard-theme="botanical"] main [class*="bg-white/"] { background-color: rgba(80, 102, 78, .06) !important; }
        .standard-essential[data-standard-theme="botanical"] main input, .standard-essential[data-standard-theme="botanical"] main select, .standard-essential[data-standard-theme="botanical"] main textarea { background: #FFFEFA !important; color: #26362D !important; border-color: rgba(73, 95, 73, .28) !important; }
        .standard-essential[data-standard-theme="botanical"] main [class*="grayscale"] { filter: sepia(.18) saturate(.82) !important; }
        .standard-essential[data-standard-theme="terracotta"] { --standard-accent: #B96E52; --standard-ink: #F8F1E8; --standard-muted: #C4AA98; background: #382820 !important; color: #F8F1E8 !important; background-image: radial-gradient(ellipse at 50% 10%, rgba(185, 110, 82, .19), transparent 48%); }
        .standard-essential[data-standard-theme="terracotta"] main > section:first-child { background: radial-gradient(circle at 50% 50%, rgba(185, 110, 82, .16), transparent 42%), repeating-radial-gradient(circle at 50% 50%, transparent 0 50px, rgba(213, 138, 105, .035) 51px 52px); }
        .standard-essential[data-standard-theme="terracotta"] main > section:nth-child(3) > div { background: linear-gradient(155deg, rgba(255,255,255,.055), rgba(185, 110, 82, .045)); box-shadow: 0 20px 60px rgba(0,0,0,.13); }
        .standard-essential[data-standard-theme="terracotta"] > section.fixed { background: #2D201A !important; color: #F8F1E8 !important; }
        .standard-essential[data-standard-theme="terracotta"] > section.fixed [class*="text-[#F8F6F0]"], .standard-essential[data-standard-theme="terracotta"] > section.fixed [class*="text-white"] { color: #F8F1E8 !important; }
        .standard-essential[data-standard-theme="terracotta"] > button.fixed { background: rgba(55, 39, 31, .95) !important; border-color: rgba(213, 138, 105, .45) !important; }
        .standard-essential[data-standard-theme="terracotta"] main [class*="text-[#C5A880]"] { color: #D58A69 !important; }
        .standard-essential[data-standard-theme="terracotta"] main [class*="text-zinc-"] { color: #C4AA98 !important; }
        .standard-essential[data-standard-theme="terracotta"] main [class*="border-white"] { border-color: rgba(231, 199, 175, .22) !important; }
        .standard-essential[data-standard-theme="terracotta"] main [class*="bg-white/"] { background-color: rgba(245, 222, 202, .055) !important; }
        .standard-essential[data-standard-theme="terracotta"] main [class*="bg-[#C5A880]"] { background-color: #B96E52 !important; }
        @media (max-width: 700px) {
          .standard-essential main { padding-top: 2.75rem; padding-bottom: 3rem; }
          .standard-essential main > section:nth-child(3) { grid-template-columns: 1fr; gap: 1.25rem; }
          .standard-essential main > section:nth-child(3) > p { margin: 0; }
          .standard-essential main > section:nth-child(4), .standard-essential main > section:nth-child(6) { grid-template-columns: 1fr; }
          .standard-essential main > section:nth-child(4) > *, .standard-essential main > section:nth-child(6) > * { grid-column: 1 !important; }
          .standard-essential main > section:first-child { min-height: 78svh; border-radius: 1.25rem; }
        }
      `}</style>
      {/* Toast Notification */}
      {toastText && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 py-2 px-5 bg-zinc-900/95 border border-[#C5A880]/50 rounded-full text-xs font-medium text-[#F8F6F0] shadow-2xl animate-fade-in backdrop-blur-md">
          {toastText}
        </div>
      )}

      {/* Top Navbar Back */}
      {onBackToLanding && (
        <header className="fixed top-0 left-0 right-0 z-40 px-5 py-3.5 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={onBackToLanding}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white hover:border-[#C5A880] transition-colors cursor-pointer"
          >
            &larr; <span>Kembali ke Beranda</span>
          </button>
          <span className="font-serif text-sm tracking-wider text-[#C5A880] font-normal">sekarsiti</span>
        </header>
      )}

      {/* 1. GATE COVER FULLSCREEN DENGAN 3D WAX SEAL */}
      {!isCoverDismissed && (
        <section
          className={`fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-between text-center px-6 py-12 overflow-hidden transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            isCoverOpen ? '-translate-y-full' : 'translate-y-0'
          }`}
        >
          {/* Ambient Gold Particles */}
          <GoldDustCanvas particleCount={30} color="#C5A880" />

          {/* Botanical Corners */}
          <BotanicalCornerFlourish position="top-left" size={54} color="#C5A880" className="absolute top-4 left-4 opacity-40 pointer-events-none" />
          <BotanicalCornerFlourish position="top-right" size={54} color="#C5A880" className="absolute top-4 right-4 opacity-40 pointer-events-none" />
          <BotanicalCornerFlourish position="bottom-left" size={54} color="#C5A880" className="absolute bottom-4 left-4 opacity-30 pointer-events-none" />
          <BotanicalCornerFlourish position="bottom-right" size={54} color="#C5A880" className="absolute bottom-4 right-4 opacity-30 pointer-events-none" />

          <p className="text-[10px] tracking-[.35em] text-zinc-500 font-serif italic relative z-10 pt-4">
            SERI STANDAR MANDIRI &middot; {eventYear}
          </p>

          <div className="relative z-10 space-y-3 max-w-md">
            <span className="text-[11px] tracking-[.35em] text-[#A1A1AA] uppercase block">
              The Wedding Celebration Of
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#F8F6F0] leading-tight">
              {brideName} <span className="italic text-zinc-500">&amp;</span> {groomName}
            </h1>
            <p className="font-serif italic text-sm text-[#C5A880]">
              {eventDateFormatted}
            </p>
          </div>

          <div className="relative z-10 w-full flex flex-col items-center gap-4">
            {!hideGuestName && (
              <div className="w-[85%] max-w-[300px] py-3.5 px-4 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xs text-center space-y-1">
                <p className="text-[10px] text-zinc-400">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                <p className="font-serif text-xl text-[#F8F6F0]">{guestName}</p>
              </div>
            )}

            {/* 3D Interactive Wax Seal */}
            <div className="flex flex-col items-center gap-1.5">
              <InteractiveWaxSeal3D
                monogram={monogram}
                dateText={String(eventYear)}
                size={110}
                colorHex={0xC5A880}
                onOpen={handleOpenInvitation}
                className="my-1"
              />
              <p className="text-[9px] tracking-[.25em] uppercase text-zinc-500 font-mono">
                Sentuh Segel Lilin 3D untuk Membuka
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenInvitation}
              className="rounded-full px-7 h-10 text-[11px] tracking-[.2em] uppercase transition hover:bg-[#F8F6F0] hover:text-black border border-[#F8F6F0]/30 cursor-pointer"
            >
              Buka Undangan
            </button>
          </div>
        </section>
      )}

      {/* Floating Audio Controller */}
      <button
        type="button"
        onClick={toggleAudio}
        aria-label="Toggle Audio"
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full border border-white/15 backdrop-blur-md bg-black/60 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
      >
        {isPlayingAudio ? (
          <Disc3 className="w-5 h-5 text-[#C5A880] animate-spin" style={{ animationDuration: '4s' }} />
        ) : (
          <Disc className="w-5 h-5 text-zinc-500" />
        )}
      </button>

      {/* Audio Toast */}
      {showAudioToast && (
        <div className="fixed top-16 right-4 z-40 py-1.5 px-3 bg-zinc-900/90 border border-white/10 rounded-full text-[10px] text-zinc-300 backdrop-blur-md">
          {isPlayingAudio ? `Musik: ${songTitle}` : 'Musik dijeda'}
        </div>
      )}

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="mx-auto px-6 py-20 space-y-32 text-center">
        {/* SECTION 1: HERO HEADER */}
        <section className="pt-12 space-y-6">
          <p className="text-[10px] tracking-[.35em] uppercase text-zinc-500">
            The Wedding Celebration
          </p>

          {/* Monogram or Photo */}
          {isPureTypography || !heroImage ? (
            <div className="py-6 space-y-4">
              <div className="w-28 h-28 mx-auto rounded-full border border-white/20 flex items-center justify-center bg-white/[0.02] shadow-2xl relative">
                <span className="font-serif text-4xl font-light text-[#F8F6F0] tracking-wider">
                  {monogram}
                </span>
                <OliveBranchSprig color="#C5A880" size={32} className="absolute -top-3 -right-3 opacity-60" />
              </div>
              <div>
                <h2 className="font-serif text-4xl sm:text-5xl font-light text-[#F8F6F0] leading-tight">
                  {brideName} <span className="italic text-zinc-500">&amp;</span> {groomName}
                </h2>
                <p className="font-serif italic text-sm text-[#C5A880] mt-2">
                  {city} &middot; {eventDateFormatted}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[3/4] bg-zinc-900">
                <img src={heroImage} alt="Foto Mempelai" className="w-full h-full object-cover filter grayscale contrast-105" />
                <span className="absolute inset-0 grid place-items-center font-serif text-8xl font-light opacity-20 pointer-events-none">
                  {monogram}
                </span>
              </div>
              <h2 className="font-serif text-4xl font-light text-[#F8F6F0]">
                {brideName} <span className="italic text-zinc-500">&amp;</span> {groomName}
              </h2>
              <p className="font-serif italic text-sm text-[#C5A880]">
                {city} &middot; {eventDateFormatted}
              </p>
            </div>
          )}

          {/* Countdown Grid */}
          <div className="grid grid-cols-4 gap-2 pt-4 max-w-xs mx-auto text-center font-mono">
            <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="block text-xl font-bold text-[#F8F6F0]">{days}</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Hari</span>
            </div>
            <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="block text-xl font-bold text-[#F8F6F0]">{hours}</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Jam</span>
            </div>
            <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="block text-xl font-bold text-[#F8F6F0]">{mins}</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Menit</span>
            </div>
            <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="block text-xl font-bold text-[#F8F6F0]">{secs}</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Detik</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: KUTIPAN SUCI */}
        <section className="py-12 border-y border-white/10 space-y-4">
          <OliveBranchSprig color="#C5A880" size={32} className="mx-auto opacity-70" />
          <p className="font-serif italic text-base leading-relaxed text-zinc-300 max-w-sm mx-auto">
            {quoteText}
          </p>
          <BotanicalVineDivider color="#C5A880" size={18} className="opacity-50 my-3" />
          <p className="text-[11px] tracking-widest text-zinc-500 uppercase font-mono">
            {quoteSource}
          </p>
        </section>

        {/* SECTION 3: KEDUA MEMPELAI */}
        <section className="space-y-12">
          {/* Mempelai Pria */}
          <div className="space-y-2">
            {groomPhoto && !isPureTypography ? (
              <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden border border-white/15 mb-4">
                <img src={groomPhoto} alt={groomFullName} className="w-full h-full object-cover filter grayscale" />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full border border-white/20 flex items-center justify-center bg-white/[0.02] mb-3">
                <span className="font-serif text-2xl text-[#C5A880]">{groomInitial}</span>
              </div>
            )}
            <h3 className="font-serif text-2xl text-[#F8F6F0]">{groomFullName}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">{groomParents}</p>
            {groomInstagram && (
              <a
                href={`https://instagram.com/${groomInstagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[11px] text-zinc-500 hover:text-white pt-1"
              >
                {groomInstagram}
              </a>
            )}
          </div>

          <p className="font-serif italic text-4xl text-zinc-600">&amp;</p>

          {/* Mempelai Wanita */}
          <div className="space-y-2">
            {bridePhoto && !isPureTypography ? (
              <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden border border-white/15 mb-4">
                <img src={bridePhoto} alt={brideFullName} className="w-full h-full object-cover filter grayscale" />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full border border-white/20 flex items-center justify-center bg-white/[0.02] mb-3">
                <span className="font-serif text-2xl text-[#C5A880]">{brideInitial}</span>
              </div>
            )}
            <h3 className="font-serif text-2xl text-[#F8F6F0]">{brideFullName}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">{brideParents}</p>
            {brideInstagram && (
              <a
                href={`https://instagram.com/${brideInstagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[11px] text-zinc-500 hover:text-white pt-1"
              >
                {brideInstagram}
              </a>
            )}
          </div>
        </section>

        {/* SECTION 4: RANGKAIAN ACARA */}
        <section className="space-y-6 text-left">
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase tracking-[.3em] text-zinc-500 font-mono">Waktu &amp; Tempat</span>
            <h2 className="font-serif text-3xl text-[#F8F6F0]">Rangkaian Acara</h2>
          </div>

          {/* Akad */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
            <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider block">Akad Nikah / Pemberkatan</span>
            <h4 className="font-serif text-lg text-white">{akadVenue}</h4>
            <p className="text-xs text-zinc-400">{eventDateFormatted} &middot; {akadTime}</p>
            <p className="text-[11px] text-zinc-500">{city}</p>
          </div>

          {/* Resepsi */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
            <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider block">Resepsi Pernikahan</span>
            <h4 className="font-serif text-lg text-white">{resepsiVenue}</h4>
            <p className="text-xs text-zinc-400">{eventDateFormatted} &middot; {resepsiTime}</p>
            <p className="text-[11px] text-zinc-500">{city}</p>
          </div>

          <div className="pt-2 text-center">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 hover:border-[#C5A880] text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Buka Petunjuk Lokasi (Google Maps)</span>
            </a>
          </div>
        </section>

        {/* SECTION 5: TANDA KASIH */}
        <section className="space-y-4">
          <h2 className="font-serif text-3xl text-[#F8F6F0]">Tanda Kasih</h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Doa restu Anda merupakan karunia terindah bagi kami. Jika ingin memberikan tanda kasih secara digital, Anda dapat melalui rekening berikut:
          </p>

          <button
            type="button"
            onClick={() => setIsGiftDrawerOpen(!isGiftDrawerOpen)}
            className="px-6 py-2.5 rounded-full border border-[#C5A880]/50 hover:border-[#C5A880] text-[#C5A880] text-xs font-semibold cursor-pointer transition-all"
          >
            {isGiftDrawerOpen ? 'Tutup Tanda Kasih' : 'Kirim Tanda Kasih Virtual'}
          </button>

          {isGiftDrawerOpen && (
            <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.03] space-y-3 max-w-sm mx-auto text-left animate-fade-in">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Nomor Rekening Resmi</span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-white">{bankName}</p>
                  <p className="font-mono text-base text-[#C5A880] tracking-wider mt-0.5">{accountNumber}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">a.n. {accountHolder}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Salin Rekening"
                >
                  {isCopied('account') ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {secondaryBankName && secondaryAccountNumber && (
                <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white">{secondaryBankName}</p>
                    <p className="font-mono text-base text-[#C5A880] tracking-wider mt-0.5">{secondaryAccountNumber}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">a.n. {secondaryAccountHolder || brideFullName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(secondaryAccountNumber.replace(/\s+/g, ''), 'secondary-account')}
                    className="shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                    title="Salin rekening kedua"
                    aria-label="Salin rekening kedua"
                  >
                    {isCopied('secondary-account') ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECTION 6: BUKU DOA & KONFIRMASI RSVP */}
        <section className="space-y-6 text-left">
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase tracking-[.3em] text-zinc-500 font-mono">Kehadiran &amp; Doa</span>
            <h2 className="font-serif text-3xl text-[#F8F6F0]">Konfirmasi RSVP</h2>
          </div>

          <form onSubmit={handleRsvpSubmit} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full text-xs p-2.5 rounded-lg border border-white/15 bg-black/40 text-white outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Kehadiran</label>
                <select
                  value={rsvpAttendance}
                  onChange={(e) => setRsvpAttendance(e.target.value as 'hadir' | 'tidak_hadir' | 'ragu')}
                  className="w-full text-xs p-2 rounded-lg border border-white/15 bg-black/40 text-white outline-none"
                >
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Tidak Hadir</option>
                  <option value="ragu">Masih Ragu</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Jumlah Tamu</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rsvpGuestCount}
                  onChange={(e) => setRsvpGuestCount(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-white/15 bg-black/40 text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Ucapan &amp; Doa Restu</label>
              <textarea
                rows={3}
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                placeholder="Tuliskan doa terbaik Anda untuk kedua mempelai..."
                className="w-full text-xs p-2.5 rounded-lg border border-white/15 bg-black/40 text-white outline-none focus:border-[#C5A880] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#C5A880] hover:bg-[#D4B68A] text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Kirim Konfirmasi &amp; Doa
            </button>
          </form>

          {/* List Wishes */}
          <div className="space-y-2.5 pt-2 max-h-64 overflow-y-auto pr-1">
            {guestbookEntries.map((w, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-white/5 bg-white/[0.015] text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <strong className="text-zinc-200">{w.name}</strong>
                  <span className="text-zinc-500 text-[10px]">{w.time}</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{w.message}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-12 border-t border-white/10 text-center space-y-2 text-zinc-500 text-[11px]">
          <p className="font-serif italic text-base text-zinc-400">
            {brideName} &amp; {groomName}
          </p>
          <p>{eventDateFormatted} &middot; {city}</p>
          <p className="text-[10px] text-zinc-600 font-mono pt-4">
            Diberdayakan oleh Sekarsiti &middot; Seri Standar Mandiri
          </p>
        </footer>
      </main>
    </div>
  );
};

export const StandardBotanikaTemplate: React.FC<StandardTemplateProps> = (props) => (
  <StandardEssentialTemplate {...props} themeStyle="botanical" />
);

export const StandardKalatidhaTemplate: React.FC<StandardTemplateProps> = (props) => (
  <StandardEssentialTemplate {...props} themeStyle="terracotta" />
);
