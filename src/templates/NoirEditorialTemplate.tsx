import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  MessageCircle, 
  Disc3, 
  Disc, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Gift, 
  Heart, 
  Check, 
  Copy 
} from 'lucide-react';
import { ClientInvitationData } from '../types/clientInvitation';
import { isVideoUrl } from '../utils/cloudinaryUpload';
import { collectAdminUploadedPhotos } from '../utils/templateMediaResolver';
import { 
  useCountdown, 
  useGuestRecipient, 
  useAudioController, 
  useClipboardCopy, 
  useGuestbook, 
  useRsvpForm 
} from '../hooks/useInvitationCore';

interface NoirEditorialTemplateProps {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

export const NoirEditorialTemplate: React.FC<NoirEditorialTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
}) => {
  // Gate cover state
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isCoverDismissed, setIsCoverDismissed] = useState(false);

  // Active section for bottom dock navigation
  const [activeNav, setActiveNav] = useState('home');

  // Gift drawer toggle & active tab
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);
  const [giftTab, setGiftTab] = useState<'rek' | 'kado'>('rek');

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Custom data extraction with Azalia & Dias defaults
  const brideName = customData?.brideName || 'Azalia';
  const brideFullName = customData?.brideFullName || 'Azalia Fasya';
  const brideParents = customData?.brideParents || 'Putri pertama dari Bapak Fasya Rahman & Ibu Dewi Lestari';
  const brideInstagram = customData?.brideInstagram || '@azaliafasya';

  const groomName = customData?.groomName || 'Dias';
  const groomFullName = customData?.groomFullName || 'Dias Taufik';
  const groomParents = customData?.groomParents || 'Putra kedua dari Bapak Taufik Hidayat & Ibu Ratna Sari';
  const groomInstagram = customData?.groomInstagram || '@diastaufik';

  const eventDateFormatted = customData?.eventDateFormatted || 'Sabtu, 14 November 2026';
  const countdownIsoDate = customData?.countdownIsoDate || '2026-11-14T08:00:00+07:00';
  const akadTime = customData?.akadTime || '08.00 – 10.00 WIB';
  const akadVenue = customData?.akadVenue || 'Masjid Agung Al-Furqon';
  const resepsiTime = customData?.resepsiTime || '11.00 – 14.00 WIB';
  const resepsiVenue = customData?.resepsiVenue || 'Gedung Sasana Budaya';
  const city = customData?.city || 'Bandung';
  const mapsUrl = customData?.mapsUrl || 'https://maps.google.com';

  const quoteText = customData?.quoteText || '“Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.”';
  const quoteSource = customData?.quoteSource || 'QS. Ar-Rum : 21';

  const bankName = customData?.bankName || 'BCA';
  const accountNumber = customData?.accountNumber || '1234 5678 9012';
  const accountHolder = customData?.accountHolder || 'Azalia Fasya';

  const songTitle = customData?.songTitle || 'Until I Found You - Acoustic Strings';
  const audioUrl = customData?.audioUrl || '';

  // Core Hooks
  const { guestName, hideGuestName } = useGuestRecipient('Nama Tamu Undangan');
  const { days, hours, mins, secs } = useCountdown(countdownIsoDate);
  const { isPlayingAudio, toggleAudio, showAudioToast } = useAudioController(songTitle, audioUrl);
  const { copyText, isCopied } = useClipboardCopy(2000);

  // Live Guestbook & RSVP Hooks
  const defaultInitialWishes = useMemo(() => [
    {
      name: 'Rina Putri',
      message: 'Selamat berbahagia Azalia & Dias, semoga senantiasa rukun dan langgeng hingga akhir hayat.',
      time: '2 jam lalu'
    },
    {
      name: 'Bima Adi',
      message: 'Barakallahu lakuma wa baraka alaika, semoga menjadi keluarga yang sakinah mawaddah warahmah.',
      time: '5 jam lalu'
    }
  ], []);

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
    isSuccess: isRsvpSuccess,
  } = useRsvpForm(() => {
    showToast('Konfirmasi kehadiran tercatat');
  }, customData?.id);

  // Media resolution with admin uploads and elegant fallback portraits
  const allAdminUploadedImages = useMemo(() => collectAdminUploadedPhotos(customData), [customData]);

  const heroImage = useMemo(() => {
    if (customData?.mediaSlots?.heroImage && !isVideoUrl(customData.mediaSlots.heroImage)) {
      return customData.mediaSlots.heroImage;
    }
    return allAdminUploadedImages[0] || '/images/editorial_couple_portrait_1790838636662.jpg';
  }, [customData, allAdminUploadedImages]);

  const groomPortrait = useMemo(() => {
    if (customData?.mediaSlots?.groomPortrait) return customData.mediaSlots.groomPortrait;
    return allAdminUploadedImages[1] || '/images/editorial_groom_portrait_1790915490996.jpg';
  }, [customData, allAdminUploadedImages]);

  const bridePortrait = useMemo(() => {
    if (customData?.mediaSlots?.bridePortrait) return customData.mediaSlots.bridePortrait;
    return allAdminUploadedImages[2] || '/images/wedding_bride_veil_1790901501919.jpg';
  }, [customData, allAdminUploadedImages]);

  const closingImage = useMemo(() => {
    if (customData?.mediaSlots?.closingImage) return customData.mediaSlots.closingImage;
    return allAdminUploadedImages[3] || '/images/film_vintage_couple_1791034007642.jpg';
  }, [customData, allAdminUploadedImages]);

  const galleryImages = useMemo(() => {
    if (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages.length > 0) {
      const valid = customData.mediaSlots.galleryImages.filter((u) => Boolean(u && !isVideoUrl(u)));
      if (valid.length > 0) return valid;
    }
    if (allAdminUploadedImages.length >= 4) return allAdminUploadedImages;
    return [
      heroImage,
      '/images/editorial_venue_rings_1790838653826.jpg',
      groomPortrait,
      bridePortrait,
    ];
  }, [customData, allAdminUploadedImages, heroImage, groomPortrait, bridePortrait]);

  // Handle open gate
  const handleOpenInvitation = () => {
    setIsCoverOpen(true);
    if (!isPlayingAudio) {
      toggleAudio();
    }
    setTimeout(() => {
      setIsCoverDismissed(true);
    }, 1200);
  };

  // Lock body scroll when gate is closed
  useEffect(() => {
    if (!isCoverOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isCoverOpen]);

  // Calendar .ics generator
  const handleDownloadCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Pernikahan ${brideName} & ${groomName}\nDESCRIPTION:Pernikahan ${brideFullName} & ${groomFullName}\nLOCATION:${akadVenue}, ${city}\nDTSTART:${eventYear}1114T010000Z\nDTEND:${eventYear}1114T070000Z\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `undangan-${brideName.toLowerCase()}-${groomName.toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Jadwal kalender berhasil diunduh');
  };

  // Handle Copy
  const handleCopyAccount = () => {
    const cleanNum = accountNumber.replace(/\s+/g, '');
    copyText(cleanNum, 'account');
    showToast('Nomor rekening berhasil disalin');
  };

  const handleCopyAddress = () => {
    const addr = `${brideFullName}\nJl. Cihampelas No. 88, Bandung 40131`;
    copyText(addr, 'address');
    showToast('Alamat kado berhasil disalin');
  };

  // Handle RSVP & Wish Submit
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
      showToast('Konfirmasi dan ucapan berhasil dikirim');
    } catch {
      showToast('Konfirmasi berhasil dicatat');
    }
  };

  // Dynamic Monogram & Initials
  const brideInitial = (brideName.trim().charAt(0) || 'A').toUpperCase();
  const groomInitial = (groomName.trim().charAt(0) || 'D').toUpperCase();
  const monogram = `${brideInitial}&${groomInitial}`;

  // Dynamic Year & Roman Numerals
  const eventYear = useMemo(() => {
    const parsed = new Date(countdownIsoDate);
    if (!isNaN(parsed.getTime())) return parsed.getFullYear();
    const match = eventDateFormatted.match(/\b(20\d{2})\b/);
    if (match) return parseInt(match[1], 10);
    return 2026;
  }, [countdownIsoDate, eventDateFormatted]);

  const romanYear = useMemo(() => {
    const lookup: Record<string, number> = {
      M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
    };
    let num = eventYear;
    let roman = '';
    for (const key in lookup) {
      while (num >= lookup[key]) {
        roman += key;
        num -= lookup[key];
      }
    }
    return roman || 'MMXXVI';
  }, [eventYear]);

  // Dynamic Story Milestones
  const storyMilestones = useMemo(() => {
    if (customData?.mediaSlots?.storyChapters && customData.mediaSlots.storyChapters.length > 0) {
      return customData.mediaSlots.storyChapters.map((ch, idx) => ({
        year: ch.date || `${eventYear - 2 + idx}`,
        title: ch.title || 'Momen Berharga',
        desc: ch.story || '',
      }));
    }
    return [
      {
        year: `${eventYear - 6}`,
        title: 'Pertemuan Pertama',
        desc: `Kami pertama kali bertemu dalam sebuah perjumpaan hangat di ${city}. Obrolan santai berlanjut menjadi hari-hari penuh kebersamaan.`
      },
      {
        year: `${eventYear - 2}`,
        title: 'Komitmen & Restu',
        desc: 'Dengan restu kedua orang tua dan keluarga, kami memantapkan niat suci untuk melangkah bersama mengarungi babak kehidupan baru.'
      },
      {
        year: `${eventYear}`,
        title: 'Hari Bahagia',
        desc: 'Sebuah kehormatan bagi kami mengundang Bapak/Ibu dan para sahabat untuk menjadi saksi pengucapan janji suci pernikahan kami.'
      }
    ];
  }, [customData, city, eventYear]);

  // Automatic Dock Navigation active state on scroll
  useEffect(() => {
    const navSections = ['home', 'couple', 'event', 'gift', 'rsvp'];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const triggerPoint = scrollY + viewportHeight * 0.35;

      for (let i = navSections.length - 1; i >= 0; i--) {
        const secId = navSections[i];
        const el = document.getElementById(secId);
        if (el) {
          const top = el.offsetTop;
          if (triggerPoint >= top) {
            setActiveNav(secId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="noir-editorial-root min-h-screen bg-[#0D0D0D] text-[#F8F6F0] font-sans antialiased selection:bg-[#F8F6F0] selection:text-[#0D0D0D] relative">
      <style>{`
        .noir-editorial-root {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .noir-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .grain::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .hairline {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-o {
          height: 38px;
          font-size: 11px;
          letter-spacing: 0.15em;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          padding: 0 14px;
        }
        .btn-o:hover, .btn-o:focus-visible {
          background: #F8F6F0;
          color: #0D0D0D;
        }
        .ph img {
          filter: grayscale(1) contrast(1.05);
          transition: filter 0.8s ease, transform 1.4s ease;
        }
        .ph:hover img {
          filter: grayscale(0.15) saturate(0.85);
          transform: scale(1.02);
        }
        .anim-spin-slow {
          animation: spin 7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .field {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          width: 100%;
          padding: 12px;
          font-size: 14px;
          outline: none;
          color: #F8F6F0;
          transition: border-color 0.3s ease;
        }
        .field:focus {
          border-color: #F8F6F0;
        }
        .field::placeholder {
          color: #52525B;
        }
        .noscroll {
          scrollbar-width: none;
        }
        .noscroll::-webkit-scrollbar {
          display: none;
        }
        .dock a.active::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          width: 3px;
          height: 3px;
          border-radius: 9999px;
          background: #FFFFFF;
          transform: translateX(-50%);
        }
      `}</style>

      {/* Floating Demo Navigation Bar (Back & Order) */}
      {(onBackToLanding || onOrderViaWhatsApp) && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs text-white/80 hover:text-white hover:bg-black/80 flex items-center gap-1.5 transition-all shadow-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
          )}
          {onOrderViaWhatsApp && (
            <button
              onClick={onOrderViaWhatsApp}
              className="px-3.5 py-1.5 rounded-full bg-[#F8F6F0] text-[#0D0D0D] font-medium text-xs hover:bg-white flex items-center gap-1.5 transition-all shadow-xl cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Pesan Desain</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================
          1. GATE COVER (FULLSCREEN PINTU PEMBUKA)
          ======================================================== */}
      {!isCoverDismissed && (
        <section
          id="gate-cover"
          className={`grain fixed inset-0 z-50 bg-[#0D0D0D] flex flex-col items-center justify-between text-center px-6 py-10 overflow-hidden transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            isCoverOpen ? '-translate-y-full' : 'translate-y-0'
          }`}
          style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}
        >
          {/* Subtle Botanical SVG watermark */}
          <svg
            className="absolute -right-10 -bottom-10 w-72 opacity-[.06] pointer-events-none"
            viewBox="0 0 200 260"
            fill="none"
            stroke="#A1A1AA"
            strokeWidth="1.2"
          >
            <path d="M100 250V120M100 120C60 110 50 50 100 10c50 40 40 100 0 110ZM100 200C70 190 40 170 30 130M100 180c25-10 50-25 62-55" />
          </svg>

          <p className="text-[10px] tracking-[.35em] text-zinc-500 self-end noir-serif italic">
            {romanYear} · {monogram}
          </p>

          <div className="relative z-10">
            <p className="text-[11px] tracking-[.35em] text-[#A1A1AA] uppercase">
              The Wedding Celebration Of
            </p>
            <h1 className="noir-serif font-light text-5xl sm:text-6xl mt-6 leading-tight">
              <span data-bind="brideName">{brideName}</span>{' '}
              <span className="italic text-zinc-500">&amp;</span>{' '}
              <span data-bind="groomName">{groomName}</span>
            </h1>
            <p className="noir-serif italic text-[#A1A1AA] mt-4 text-lg" data-bind="eventDateFormatted">
              {eventDateFormatted}
            </p>
          </div>

          <div className="relative z-10 w-full flex flex-col items-center gap-6">
            {!hideGuestName && (
              <div
                id="guest-badge"
                className="hairline w-[85%] max-w-[320px] py-4 px-4 bg-white/[0.02]"
              >
                <p className="text-[11px] text-[#A1A1AA]">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                <p id="guest-name" className="noir-serif text-2xl mt-1 text-[#F8F6F0]">
                  {guestName}
                </p>
              </div>
            )}

            <button
              id="btn-open-invitation"
              onClick={handleOpenInvitation}
              className="rounded-full px-8 h-11 text-xs tracking-[.2em] uppercase transition hover:bg-[#F8F6F0] hover:text-black border border-[#F8F6F0]/30 cursor-pointer"
            >
              Buka Undangan
            </button>
          </div>
        </section>
      )}

      {/* ========================================================
          2. FLOATING AUDIO DISK BUTTON
          ======================================================== */}
      <button
        id="audio-toggle-btn"
        onClick={toggleAudio}
        aria-label="Putar atau jeda musik"
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full hairline backdrop-blur-md bg-[#0D0D0D]/70 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        {isPlayingAudio ? (
          <Disc3 className="w-5 h-5 text-[#F8F6F0] anim-spin-slow" />
        ) : (
          <Disc className="w-5 h-5 text-[#F8F6F0]/50" />
        )}
      </button>

      {/* Audio Toast Status */}
      {showAudioToast && (
        <div className="fixed top-16 right-4 z-40 py-1.5 px-3 bg-[#18181B]/90 backdrop-blur-md border border-white/10 rounded-full text-[11px] text-[#F8F6F0] shadow-xl">
          {isPlayingAudio ? `Musik: ${songTitle}` : 'Musik dijeda'}
        </div>
      )}

      {/* ========================================================
          3. LAYOUT SPLIT (CIRI KHAS SEKARSITI - OPSI A)
          ======================================================== */}
      <div className="lg:flex">
        {/* PANEL KIRI (DESKTOP STAGE ~50% - STICKY) */}
        <aside className="hidden lg:block lg:w-1/2 h-screen sticky top-0 overflow-hidden bg-[#0A0A0A]">
          <img
            data-slot="heroImage"
            src={heroImage}
            alt="Foto editorial mempelai"
            className="w-full h-full object-cover filter grayscale brightness-70"
          />
          <div
            className="absolute inset-0 flex flex-col justify-end p-12"
            style={{ background: 'linear-gradient(transparent 35%, #0D0D0D 95%)' }}
          >
            <p className="noir-serif text-[8.5rem] leading-none font-light opacity-20 select-none">
              {monogram}
            </p>
            <p className="noir-serif italic text-lg text-[#A1A1AA] mt-2">
              {city}, {eventDateFormatted}
            </p>
          </div>
        </aside>

        {/* PANEL KANAN (DEVICE FRAME SCROLLABLE) */}
        <main className="lg:w-1/2 flex justify-center">
          <div className="w-full max-w-[480px] px-6 pb-40" id="scroll-root">

            {/* SECTION 1: HERO */}
            <section id="home" className="pt-16 text-center lg:pt-0 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
              <div className="hidden lg:block mb-10">
                <p className="text-[11px] tracking-[.35em] text-[#A1A1AA] uppercase">
                  The Wedding Celebration Of
                </p>
                <p className="noir-serif font-light text-[7rem] leading-none opacity-20 mt-4 select-none">
                  {monogram}
                </p>
                <h2 className="noir-serif font-light text-5xl -mt-8 relative">
                  <span data-bind="brideName">{brideName}</span>{' '}
                  <span className="italic text-zinc-500">&amp;</span>{' '}
                  <span data-bind="groomName">{groomName}</span>
                </h2>
                <div className="w-px h-10 bg-white/20 mx-auto mt-8"></div>
              </div>

              {/* Mobile Hero Image (Hidden in Desktop Split) */}
              <figure className="ph relative overflow-hidden hairline p-1 lg:hidden">
                <img
                  data-slot="heroImage"
                  src={heroImage}
                  alt="Foto mempelai"
                  className="w-full aspect-[3/4] object-cover"
                />
                <span className="absolute inset-0 grid place-items-center noir-serif text-8xl font-light opacity-25 pointer-events-none select-none">
                  {monogram}
                </span>
              </figure>
              <p className="noir-serif italic text-sm text-[#A1A1AA] mt-3 lg:mt-0">
                {city} · <span data-bind="eventDateFormatted">{eventDateFormatted}</span>
              </p>
            </section>

            {/* SECTION 2: KUTIPAN SUCI */}
            <section className="py-24 text-center max-w-md mx-auto">
              <div className="w-px h-10 bg-white/20 mx-auto mb-8"></div>
              <p className="noir-serif italic text-[17px] leading-relaxed text-zinc-200" data-bind="quoteText">
                {quoteText}
              </p>
              <p
                className="text-xs text-zinc-500 tracking-wider mt-5 uppercase"
                style={{ fontVariant: 'small-caps' }}
                data-bind="quoteSource"
              >
                {quoteSource}
              </p>
            </section>

            {/* SECTION 3: MEMPELAI & KELUARGA */}
            <section id="couple" className="text-center space-y-12">
              {/* Mempelai Pria */}
              <div>
                <figure
                  className="ph overflow-hidden mx-auto max-w-[340px]"
                  style={{ boxShadow: '0 20px 40px -20px #000' }}
                >
                  <img
                    data-slot="groomPortrait"
                    src={groomPortrait}
                    alt="Mempelai pria"
                    className="w-full aspect-[3/4] object-cover"
                  />
                </figure>
                <h2 className="noir-serif text-[28px] mt-6" data-bind="groomFullName">
                  {groomFullName}
                </h2>
                <p className="text-[13px] text-[#A1A1AA] mt-2 leading-relaxed" data-bind="groomParents">
                  {groomParents}
                </p>
                {groomInstagram && (
                  <a
                    href={`https://instagram.com/${groomInstagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-zinc-500 border-b border-white/10 hover:text-white"
                  >
                    {groomInstagram}
                  </a>
                )}
              </div>

              <p className="noir-serif italic text-5xl text-zinc-600 select-none">&amp;</p>

              {/* Mempelai Wanita */}
              <div>
                <figure
                  className="ph overflow-hidden mx-auto max-w-[340px]"
                  style={{ boxShadow: '0 20px 40px -20px #000' }}
                >
                  <img
                    data-slot="bridePortrait"
                    src={bridePortrait}
                    alt="Mempelai wanita"
                    className="w-full aspect-[3/4] object-cover"
                  />
                </figure>
                <h2 className="noir-serif text-[28px] mt-6" data-bind="brideFullName">
                  {brideFullName}
                </h2>
                <p className="text-[13px] text-[#A1A1AA] mt-2 leading-relaxed" data-bind="brideParents">
                  {brideParents}
                </p>
                {brideInstagram && (
                  <a
                    href={`https://instagram.com/${brideInstagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-zinc-500 border-b border-white/10 hover:text-white"
                  >
                    {brideInstagram}
                  </a>
                )}
              </div>
            </section>

            {/* SECTION 4: RANGKAIAN ACARA */}
            <section id="event" className="pt-28 space-y-5">
              <h2 className="noir-serif text-3xl text-center mb-8">Rangkaian Acara</h2>

              {/* Akad Nikah */}
              <article className="hairline bg-[#18181B] p-6 text-center">
                <h3 className="noir-serif text-[22px]">Akad Nikah</h3>
                <p className="text-sm text-zinc-300 mt-3" data-bind="eventDateFormatted">
                  {eventDateFormatted}
                </p>
                <span
                  className="inline-block mt-2 px-3 py-1 text-[11px] rounded-full border border-white/20"
                  data-bind="akadTime"
                >
                  {akadTime}
                </span>
                <p className="font-semibold text-sm mt-4" data-bind="akadVenue">
                  {akadVenue}
                </p>
                <p className="text-[13px] text-zinc-500 mt-1">{city}</p>
                <div className="flex gap-2 justify-center mt-5 flex-wrap">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-bind="mapsUrl"
                    className="btn-o inline-flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>BUKA PETA</span>
                  </a>
                  <button
                    onClick={handleDownloadCalendar}
                    className="btn-o inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>SIMPAN KE KALENDER</span>
                  </button>
                </div>
              </article>

              {/* Resepsi */}
              <article className="hairline bg-[#18181B] p-6 text-center">
                <h3 className="noir-serif text-[22px]">Resepsi Pernikahan</h3>
                <p className="text-sm text-zinc-300 mt-3" data-bind="eventDateFormatted">
                  {eventDateFormatted}
                </p>
                <span
                  className="inline-block mt-2 px-3 py-1 text-[11px] rounded-full border border-white/20"
                  data-bind="resepsiTime"
                >
                  {resepsiTime}
                </span>
                <p className="font-semibold text-sm mt-4" data-bind="resepsiVenue">
                  {resepsiVenue}
                </p>
                <p className="text-[13px] text-zinc-500 mt-1">{city}</p>
                <div className="flex gap-2 justify-center mt-5 flex-wrap">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-o inline-flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>BUKA PETA</span>
                  </a>
                  <button
                    onClick={handleDownloadCalendar}
                    className="btn-o inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>SIMPAN KE KALENDER</span>
                  </button>
                </div>
              </article>
            </section>

            {/* SECTION 5: HITUNG MUNDUR (COUNTDOWN) */}
            <section className="py-24">
              <div className="grid grid-cols-4 text-center">
                <div className="border-r border-white/10">
                  <p id="cd-days" className="noir-serif font-light text-[40px] text-[#F8F6F0]">
                    {days}
                  </p>
                  <p className="text-[9px] tracking-[.25em] text-zinc-500 uppercase">Hari</p>
                </div>
                <div className="border-r border-white/10">
                  <p id="cd-hours" className="noir-serif font-light text-[40px] text-[#F8F6F0]">
                    {hours}
                  </p>
                  <p className="text-[9px] tracking-[.25em] text-zinc-500 uppercase">Jam</p>
                </div>
                <div className="border-r border-white/10">
                  <p id="cd-mins" className="noir-serif font-light text-[40px] text-[#F8F6F0]">
                    {mins}
                  </p>
                  <p className="text-[9px] tracking-[.25em] text-zinc-500 uppercase">Menit</p>
                </div>
                <div>
                  <p id="cd-secs" className="noir-serif font-light text-[40px] text-[#F8F6F0]">
                    {secs}
                  </p>
                  <p className="text-[9px] tracking-[.25em] text-zinc-500 uppercase">Detik</p>
                </div>
              </div>
            </section>

            {/* SECTION 6: GALERI MOMEN (COLLAGE & LIGHTBOX) */}
            <section id="gallery">
              <h2 className="noir-serif text-3xl text-center mb-8">Our Moments</h2>
              <div className="grid grid-cols-5 gap-2">
                <figure
                  onClick={() => setLightboxIndex(0)}
                  className="ph col-span-3 row-span-2 overflow-hidden cursor-zoom-in"
                >
                  <img
                    data-slot="galleryImages"
                    src={galleryImages[0]}
                    alt="Galeri 1"
                    className="w-full h-full object-cover aspect-[3/4]"
                  />
                </figure>
                <figure
                  onClick={() => setLightboxIndex(1)}
                  className="ph col-span-2 overflow-hidden cursor-zoom-in"
                >
                  <img
                    data-slot="galleryImages"
                    src={galleryImages[1 % galleryImages.length]}
                    alt="Galeri 2"
                    className="w-full h-full object-cover aspect-square"
                  />
                </figure>
                <figure
                  onClick={() => setLightboxIndex(2)}
                  className="ph col-span-2 overflow-hidden cursor-zoom-in"
                >
                  <img
                    data-slot="galleryImages"
                    src={galleryImages[2 % galleryImages.length]}
                    alt="Galeri 3"
                    className="w-full h-full object-cover aspect-square"
                  />
                </figure>
                <figure
                  onClick={() => setLightboxIndex(3)}
                  className="ph col-span-5 overflow-hidden cursor-zoom-in"
                >
                  <img
                    data-slot="galleryImages"
                    src={galleryImages[3 % galleryImages.length]}
                    alt="Galeri 4"
                    className="w-full object-cover aspect-video"
                  />
                </figure>
              </div>
            </section>

            {/* SECTION 7: KISAH KASIH */}
            <section className="pt-28">
              <h2 className="noir-serif text-3xl text-center mb-10">Kisah Kasih</h2>
              <div className="relative pl-8 space-y-10">
                <span className="absolute left-[3px] top-1 bottom-1 w-px bg-white/10"></span>
                {storyMilestones.map((st, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-8 top-1.5 w-2 h-2 rounded-full border-[1.5px] border-[#F8F6F0] bg-[#0D0D0D]"></span>
                    <p className="noir-serif italic text-sm text-[#C5BDB5]">{st.year}</p>
                    <h3 className="font-semibold text-base mt-1">{st.title}</h3>
                    <p className="text-[13px] text-[#A1A1AA] mt-2 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 8: TANDA KASIH (AMPLOP DIGITAL & KADO FISIK) */}
            <section id="gift" className="pt-28 text-center">
              <h2 className="noir-serif text-3xl">Tanda Kasih</h2>
              <button
                id="gift-toggle"
                onClick={() => setIsGiftDrawerOpen(!isGiftDrawerOpen)}
                className="btn-o mt-6 cursor-pointer"
                aria-expanded={isGiftDrawerOpen}
              >
                {isGiftDrawerOpen ? 'TUTUP TANDA KASIH' : 'KIRIM HADIAH VIRTUAL'}
              </button>

              {isGiftDrawerOpen && (
                <div id="gift-drawer" className="mt-6 text-left">
                  <div className="flex justify-center gap-6 text-xs mb-4">
                    <button
                      onClick={() => setGiftTab('rek')}
                      className={`tab pb-1 border-b cursor-pointer transition-colors ${
                        giftTab === 'rek' ? 'border-white text-white' : 'border-transparent text-zinc-500'
                      }`}
                    >
                      Rekening Bank
                    </button>
                    <button
                      onClick={() => setGiftTab('kado')}
                      className={`tab pb-1 border-b cursor-pointer transition-colors ${
                        giftTab === 'kado' ? 'border-white text-white' : 'border-transparent text-zinc-500'
                      }`}
                    >
                      Kado Fisik
                    </button>
                  </div>

                  {giftTab === 'rek' && (
                    <div id="tab-rek" className="hairline p-6 bg-[#151518]">
                      <p className="text-[11px] tracking-[.3em] text-zinc-500 uppercase" data-bind="bankName">
                        {bankName}
                      </p>
                      <p id="acc-num" className="font-mono text-lg mt-5 tracking-wider text-[#F8F6F0]" data-bind="accountNumber">
                        {accountNumber}
                      </p>
                      <p className="text-[13px] text-[#A1A1AA] mt-1" data-bind="accountHolder">
                        a.n. {accountHolder}
                      </p>
                      <button
                        id="btn-copy-acc"
                        onClick={handleCopyAccount}
                        className="btn-o mt-5 flex items-center gap-1.5 cursor-pointer"
                      >
                        {isCopied('account') ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>TERSALIN</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>SALIN NOMOR</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {giftTab === 'kado' && (
                    <div id="tab-kado" className="hairline p-6 bg-[#151518]">
                      <p className="text-sm leading-relaxed text-zinc-300">
                        {brideFullName}
                        <br />
                        Jl. Cihampelas No. 88, Bandung 40131
                      </p>
                      <button
                        id="btn-copy-addr"
                        onClick={handleCopyAddress}
                        className="btn-o mt-5 flex items-center gap-1.5 cursor-pointer"
                      >
                        {isCopied('address') ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>TERSALIN</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>SALIN ALAMAT</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* SECTION 9: RSVP & DOA RESTU */}
            <section id="rsvp" className="pt-28">
              <h2 className="noir-serif text-3xl text-center tracking-wide mb-8">RSVP &amp; Doa Restu</h2>

              <form id="rsvp-form" onSubmit={handleRsvpSubmit} className="space-y-4">
                <input
                  id="r-name"
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  className="field"
                  placeholder="Nama lengkap Anda"
                  aria-label="Nama lengkap"
                />

                <div className="flex gap-6 text-sm py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="att"
                      checked={rsvpAttendance === 'hadir'}
                      onChange={() => setRsvpAttendance('hadir')}
                      className="accent-[#F8F6F0]"
                    />
                    <span>Hadir</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="att"
                      checked={rsvpAttendance === 'tidak_hadir'}
                      onChange={() => setRsvpAttendance('tidak_hadir')}
                      className="accent-[#F8F6F0]"
                    />
                    <span>Berhalangan</span>
                  </label>
                </div>

                <select
                  value={rsvpGuestCount}
                  onChange={(e) => setRsvpGuestCount(e.target.value)}
                  className="field cursor-pointer"
                  aria-label="Jumlah tamu"
                >
                  <option value="1" className="bg-black">1 orang</option>
                  <option value="2" className="bg-black">2 orang</option>
                  <option value="3" className="bg-black">3 orang</option>
                </select>

                <textarea
                  id="r-msg"
                  rows={3}
                  value={wishMessage}
                  onChange={(e) => setWishMessage(e.target.value)}
                  className="field resize-none"
                  placeholder="Tuliskan ucapan dan doa hangat..."
                  aria-label="Ucapan"
                ></textarea>

                <button
                  id="r-send"
                  type="submit"
                  className="w-full h-11 text-xs tracking-[.2em] bg-[#F8F6F0] text-black uppercase font-medium hover:bg-white transition-colors cursor-pointer"
                >
                  KIRIM KONFIRMASI
                </button>
              </form>

              <p className="text-[11px] tracking-[.2em] text-zinc-500 mt-12 mb-3">DAFTAR DOA RESTU</p>

              {/* Wishes List */}
              <div id="wishes" className="noscroll max-h-[380px] overflow-y-auto space-y-3">
                {guestbookEntries && guestbookEntries.length > 0 ? (
                  guestbookEntries.map((item, idx) => (
                    <div key={idx} className="hairline p-4 bg-white/[0.01]">
                      <div className="flex justify-between items-center">
                        <b className="text-sm font-medium text-white">{item.name}</b>
                        <span className="text-[10px] text-zinc-500">{item.time}</span>
                      </div>
                      <p className="text-[13px] text-[#A1A1AA] mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="hairline p-4">
                      <div className="flex justify-between items-center">
                        <b className="text-sm font-medium">Rina Putri</b>
                        <span className="text-[10px] text-zinc-500">2 jam lalu</span>
                      </div>
                      <p className="text-[13px] text-[#A1A1AA] mt-1">
                        Selamat berbahagia Azalia &amp; Dias, semoga senantiasa rukun dan langgeng hingga akhir hayat.
                      </p>
                    </div>
                    <div className="hairline p-4">
                      <div className="flex justify-between items-center">
                        <b className="text-sm font-medium">Bima Adi</b>
                        <span className="text-[10px] text-zinc-500">5 jam lalu</span>
                      </div>
                      <p className="text-[13px] text-[#A1A1AA] mt-1">
                        Barakallahu lakuma wa baraka alaika, semoga menjadi keluarga yang sakinah mawaddah warahmah.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* SECTION 10: FOOTER */}
            <footer className="pt-28 text-center">
              <figure className="ph overflow-hidden mb-10">
                <img
                  data-slot="closingImage"
                  src={closingImage}
                  alt="Foto penutup"
                  className="w-full aspect-video object-cover"
                />
              </figure>
              <p className="text-[11px] tracking-[.25em] text-zinc-500 mb-5">TURUT MENGUNDANG</p>
              <div className="grid grid-cols-2 gap-4 text-[13px] text-[#A1A1AA] leading-relaxed">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Mempelai Pria</span>
                  <p className="leading-snug">{groomParents || 'Keluarga Besar Bapak Taufik Hidayat'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Mempelai Wanita</span>
                  <p className="leading-snug">{brideParents || 'Keluarga Besar Bapak Fasya Rahman'}</p>
                </div>
              </div>
              <p className="noir-serif text-6xl font-light opacity-25 mt-12 select-none">
                {monogram}
              </p>
              <p className="noir-serif italic text-[15px] text-zinc-300 mt-4 leading-relaxed max-w-sm mx-auto">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
              </p>
              <div className="w-16 h-px bg-white/10 mx-auto my-8"></div>
              <p className="text-[10px] text-zinc-600">
                © {eventYear} {brideName} &amp; {groomName} · Sekarsiti Quiet Luxury
              </p>
            </footer>

          </div>
        </main>
      </div>

      {/* ========================================================
          4. BOTTOM FLOATING DOCK (NAVIGASI CEPAT)
          ======================================================== */}
      <nav
        className="dock fixed left-1/2 -translate-x-1/2 z-40 flex gap-1 rounded-full px-3 py-1 hairline backdrop-blur-md"
        style={{
          bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          background: 'rgba(18, 18, 18, 0.85)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}
        aria-label="Navigasi"
      >
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('home');
            document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label="Awal"
          className={`relative w-11 h-11 grid place-items-center transition-colors ${
            activeNav === 'home' ? 'active text-white' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <svg className="w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </a>
        <a
          href="#couple"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('couple');
            document.getElementById('couple')?.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label="Mempelai"
          className={`relative w-11 h-11 grid place-items-center transition-colors ${
            activeNav === 'couple' ? 'active text-white' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <svg className="w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="8" cy="8" r="3" />
            <circle cx="16" cy="8" r="3" />
            <path d="M2 20c0-4 3-6 6-6s6 2 6 6M12 20c0-3 2-5 4-5s6 1 6 5" />
          </svg>
        </a>
        <a
          href="#event"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('event');
            document.getElementById('event')?.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label="Lokasi Acara"
          className={`relative w-11 h-11 grid place-items-center transition-colors ${
            activeNav === 'event' ? 'active text-white' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <svg className="w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </a>
        <a
          href="#gift"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('gift');
            document.getElementById('gift')?.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label="Tanda Kasih"
          className={`relative w-11 h-11 grid place-items-center transition-colors ${
            activeNav === 'gift' ? 'active text-white' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <svg className="w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="8" width="18" height="13" />
            <path d="M3 12h18M12 8v13M12 8C9 8 7 3 10 3s2 5 2 5Zm0 0c3 0 5-5 2-5s-2 5-2 5Z" />
          </svg>
        </a>
        <a
          href="#rsvp"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('rsvp');
            document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label="RSVP"
          className={`relative w-11 h-11 grid place-items-center transition-colors ${
            activeNav === 'rsvp' ? 'active text-white' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <svg className="w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="5" width="18" height="14" rx="1" />
            <path d="m3 7 9 7 9-7" />
          </svg>
        </a>
      </nav>

      {/* ========================================================
          5. TOAST NOTIFIKASI MELAYANG
          ======================================================== */}
      <div
        id="toast-notification"
        className={`fixed left-1/2 -translate-x-1/2 z-[60] px-4 py-2 text-xs bg-[#F8F6F0] text-black shadow-2xl transition-all duration-300 pointer-events-none ${
          toastText ? 'opacity-100 -translate-y-2' : 'opacity-0 translate-y-0'
        }`}
        style={{ bottom: '6rem' }}
      >
        {toastText}
      </div>

      {/* ========================================================
          6. LIGHTBOX GALERI MOMEN
          ======================================================== */}
      {lightboxIndex !== null && (
        <div
          id="lightbox"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Tutup"
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : 0));
            }}
            aria-label="Sebelumnya"
            className="absolute left-4 text-3xl font-serif text-white/70 hover:text-white p-3 cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={galleryImages[lightboxIndex]}
            alt={`Momen ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] object-contain shadow-2xl select-none"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryImages.length : 0));
            }}
            aria-label="Berikutnya"
            className="absolute right-4 text-3xl font-serif text-white/70 hover:text-white p-3 cursor-pointer"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};
