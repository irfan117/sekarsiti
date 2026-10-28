import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Disc3,
  Disc,
  MapPin,
  Check,
  Copy,
  Clock,
  X,
  Send
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

interface PasangTemplateProps {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

export const PasangTemplate: React.FC<PasangTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const tideBarRef = useRef<HTMLDivElement>(null);

  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isCoverDismissed, setIsCoverDismissed] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');
  const [tidePercent, setTidePercent] = useState(10);
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Custom data mapping
  const brideName = customData?.brideName || 'Nadia';
  const brideFullName = customData?.brideFullName || 'Nadia Safitri Rahmawati';
  const brideParents = customData?.brideParents || 'Putri dari Bapak Hendra Wijaya & Ibu Sri Lestari';
  const groomName = customData?.groomName || 'Raka';
  const groomFullName = customData?.groomFullName || 'Raka Aditya Pratama';
  const groomParents = customData?.groomParents || 'Putra dari Bapak Dedi Kurniawan & Ibu Ratna Dewi';

  const eventDateFormatted = customData?.eventDateFormatted || 'Sabtu, 14 November 2026';
  const countdownIsoDate = customData?.countdownIsoDate || '2026-11-14T08:00:00+07:00';

  const akadTime = customData?.akadTime || '08.00 – 10.00 WIB';
  const akadVenue = customData?.akadVenue || 'Masjid Al-Hikmah, Jl. Dago No. 12, Bandung';
  const resepsiTime = customData?.resepsiTime || '11.00 – 14.00 WIB';
  const resepsiVenue = customData?.resepsiVenue || 'Gedung Serbaguna Parahyangan, Bandung';
  const mapsUrl = customData?.mapsUrl || 'https://maps.google.com';

  const quoteText =
    customData?.quoteText ||
    '“Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan untukmu agar kamu merasa tenteram kepadanya.”';
  const quoteSource = customData?.quoteSource || 'QS. Ar-Rum: 21';

  const bankName = customData?.bankName || 'Bank Central Asia';
  const accountNumber = customData?.accountNumber || '1234 5678 90';
  const accountHolder = customData?.accountHolder || 'Nadia Safitri Rahmawati';

  const songTitle = customData?.songTitle || 'Ocean Waves & Acoustic Strings';
  const audioUrl = customData?.audioUrl || '';

  // Media slots
  const uploadedPhotos = useMemo(() => collectAdminUploadedPhotos(customData), [customData]);

  const defaultHero = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80';
  const defaultBride = 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=700&q=80';
  const defaultGroom = 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=700&q=80';
  const defaultClosing = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80';

  const heroImage = customData?.mediaSlots?.heroImage || uploadedPhotos[0] || defaultHero;
  const bridePortrait = customData?.mediaSlots?.bridePortrait || uploadedPhotos[1] || defaultBride;
  const groomPortrait = customData?.mediaSlots?.groomPortrait || uploadedPhotos[2] || defaultGroom;
  const closingImage = customData?.mediaSlots?.closingImage || uploadedPhotos[7] || defaultClosing;

  const galleryImages = useMemo(() => {
    const raw = customData?.mediaSlots?.galleryImages;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    const fallbacks = [
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=75',
      'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=600&q=75',
      'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=600&q=75',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=75',
    ];
    const picked = uploadedPhotos.slice(3, 7);
    return picked.length >= 4 ? picked : [...picked, ...fallbacks].slice(0, 4);
  }, [customData?.mediaSlots?.galleryImages, uploadedPhotos]);

  // Reactive Left Panel Stage Slides per section
  const stageChapters = useMemo(
    () => [
      { id: 'hero', num: '01', title: 'Pesisir Awal', sub: 'Surat dari tepi pantai kebahagiaan', img: heroImage },
      { id: 'pesan', num: '02', title: 'Amanat Lautan', sub: quoteSource, img: heroImage },
      { id: 'mempelai', num: '03', title: 'Dua Arus, Satu Muara', sub: `${brideName} & ${groomName}`, img: bridePortrait },
      { id: 'countdown', num: '04', title: 'Air Pasang Menuju Hari Itu', sub: eventDateFormatted, img: groomPortrait },
      { id: 'acara', num: '05', title: 'Pelabuhan Janji', sub: 'Akad Nikah & Resepsi', img: galleryImages[0] },
      { id: 'galeri', num: '06', title: 'Yang Dibawa Ombak', sub: 'Potret kenangan di pesisir', img: galleryImages[1] },
      { id: 'kasih', num: '07', title: 'Tanda Kasih', sub: 'Berbagi kebahagiaan bersama kami', img: galleryImages[2] },
      { id: 'rsvp', num: '08', title: 'Konfirmasi Kehadiran', sub: 'Kami menantikan kehadiranmu', img: galleryImages[3] },
      { id: 'wishes', num: '09', title: 'Untaian Doa', sub: 'Pesan hangat dari sahabat & kerabat', img: closingImage },
      { id: 'penutup', num: '10', title: 'Sampai Bertemu', sub: 'Di tepi pantai kebahagiaan kami', img: closingImage },
    ],
    [heroImage, bridePortrait, groomPortrait, galleryImages, closingImage, brideName, groomName, eventDateFormatted, quoteSource]
  );

  // Hooks
  const { guestName, hideGuestName } = useGuestRecipient('Nama Tamu');
  const { days, hours, mins, secs } = useCountdown(countdownIsoDate);
  const { isPlayingAudio, toggleAudio } = useAudioController(songTitle, audioUrl);
  const { copyText, isCopied } = useClipboardCopy(2200);

  const defaultInitialWishes = useMemo(
    () => [
      {
        name: 'Keluarga Besar Hendra',
        message: 'Semoga bahtera rumah tangga kalian selalu dalam limpahan ketenangan dan keberkahan.',
        time: '2 hari lalu',
      },
      {
        name: 'Dina & Fajar',
        message: 'Selamat Nadia dan Raka! Semoga selalu kompak dan bahagia mengarungi perjalanan baru bersama.',
        time: '1 hari lalu',
      },
      {
        name: 'Pak Imam',
        message: 'Barakallah untuk kedua mempelai, doa terbaik menyertai langkah kalian berdua.',
        time: '6 jam lalu',
      },
    ],
    []
  );

  const { wishes, nameInput, setNameInput, messageInput, setMessageInput, submitWish } = useGuestbook(
    defaultInitialWishes,
    customData?.id
  );

  const {
    rsvpName,
    setRsvpName,
    attendance: rsvpAttendance,
    setAttendance: setRsvpAttendance,
    guestCount: rsvpGuestCount,
    setGuestCount: setRsvpGuestCount,
    submitRsvp,
    isSuccess: isRsvpSuccess,
  } = useRsvpForm(undefined, customData?.id);

  // Lock body scroll while gate is closed
  useEffect(() => {
    if (!isCoverDismissed && !isCoverOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCoverDismissed, isCoverOpen]);

  // IntersectionObserver for .reveal and .wipe + Scroll listener for Tide Water & Scroll-Spy
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // 1. Reveal & Wipe observer
    const revealEls = root.querySelectorAll('.reveal, .wipe');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));

    // 2. Scroll progress (tide water + top tide bar) & accurate Scroll-Spy
    const secIds = ['hero', 'pesan', 'mempelai', 'countdown', 'acara', 'galeri', 'kasih', 'rsvp', 'wishes', 'penutup'];
    let ticking = false;

    const updateOnScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      if (waterRef.current) {
        waterRef.current.style.setProperty('--p', String(p));
      }
      if (tideBarRef.current) {
        tideBarRef.current.style.transform = `scaleX(${p})`;
      }
      setTidePercent(Math.round(10 + p * 78));

      const targetY = window.innerHeight * 0.42;
      let bestId = 'hero';
      let bestDist = Infinity;

      for (const id of secIds) {
        const el = document.getElementById(`pasang-${id}`);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= targetY && rect.bottom >= targetY * 0.35) {
          bestId = id;
          bestDist = 0;
          break;
        }
        const dist = Math.abs(rect.top - targetY);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = id;
        }
      }

      setActiveNav(bestId);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateOnScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateOnScroll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [isCoverDismissed]);

  // Desktop Left Panel 3D Mouse Parallax
  const handleLeftMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!leftPanelRef.current || !parallaxRef.current) return;
    const r = leftPanelRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    parallaxRef.current.style.transform = `translate(${x * 16}px, ${y * 16}px) rotate(${x * 1.4}deg)`;
  };

  const handleLeftMouseLeave = () => {
    if (parallaxRef.current) {
      parallaxRef.current.style.transform = '';
    }
  };

  // Button ripple effect helper
  const triggerRipple = (e: React.PointerEvent<HTMLElement>) => {
    const b = e.currentTarget;
    const r = b.getBoundingClientRect();
    const s = Math.max(r.width, r.height) / 4;
    const d = document.createElement('span');
    d.className = 'r';
    d.style.width = d.style.height = `${s * 2}px`;
    d.style.left = `${e.clientX - r.left - s}px`;
    d.style.top = `${e.clientY - r.top - s}px`;
    b.appendChild(d);
    setTimeout(() => d.remove(), 750);
  };

  const handleOpenCover = () => {
    setIsCoverOpen(true);
    if (!isPlayingAudio) {
      toggleAudio();
    }
    setTimeout(() => {
      setIsCoverDismissed(true);
    }, 1500);
  };

  const handleCopyAccount = () => {
    copyText(accountNumber.replace(/\s/g, ''), 'pasang-acc');
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2200);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(`pasang-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeChapter = stageChapters.find((c) => c.id === activeNav) || stageChapters[0];

  return (
    <div
      ref={rootRef}
      className={`pasang-root min-h-screen bg-[#EAE1D0] text-[#0F3A4A] antialiased selection:bg-[#E8806A] selection:text-[#F4EEE3] relative ${
        isCoverOpen ? 'go' : ''
      } ${isPlayingAudio ? 'on' : ''}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,500;12..96,700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=Manrope:wght@400;500;600&display=swap');

        .pasang-root {
          font-family: 'Manrope', system-ui, sans-serif;
          color: #0F3A4A;
          background: #EAE1D0;
        }
        .font-display-pasang {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
        }
        .font-serif-pasang {
          font-family: 'Newsreader', Georgia, serif;
        }
        .pasang-wave {
          width: 200%;
          height: 100%;
          animation: pasangFlow 9s linear infinite;
        }
        .pasang-wave.slow {
          animation-duration: 16s;
        }
        .pasang-wave.rev {
          animation-direction: reverse;
          animation-duration: 12s;
        }
        @keyframes pasangFlow {
          to { transform: translateX(-50%); }
        }
        .pasang-pebble {
          border-radius: 48% 52% 50% 50% / 55% 45% 55% 45%;
          animation: pasangMorph 9s ease-in-out infinite alternate;
        }
        .pasang-pebble.b {
          animation-delay: -4s;
        }
        @keyframes pasangMorph {
          to { border-radius: 55% 45% 42% 58% / 46% 56% 44% 54%; }
        }
        .pasang-root .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity .9s ease, transform 1s cubic-bezier(.2, .8, .2, 1);
          transition-delay: var(--d, 0s);
        }
        .pasang-root .reveal.in {
          opacity: 1;
          transform: none;
        }
        .pasang-root .wipe {
          clip-path: inset(0 0 100% 0);
          transition: clip-path 1.2s cubic-bezier(.7, 0, .2, 1);
          transition-delay: var(--d, 0s);
        }
        .pasang-root .wipe.in {
          clip-path: inset(0 0 0 0);
        }
        .pasang-root .rise {
          display: inline-block;
          opacity: 0;
          transform: translateY(70%);
        }
        .pasang-root.go .rise {
          animation: pasangRise 1.1s cubic-bezier(.2, .8, .2, 1) forwards;
          animation-delay: var(--d, 0s);
        }
        @keyframes pasangRise {
          to { opacity: 1; transform: none; }
        }
        .pasang-bub {
          position: absolute;
          bottom: -20px;
          border-radius: 50%;
          border: 1px solid rgba(47, 111, 126, .35);
          animation: pasangUp var(--t, 12s) linear infinite;
          animation-delay: var(--dl, 0s);
        }
        @keyframes pasangUp {
          to { transform: translateY(-110vh) translateX(var(--x, 20px)); opacity: 0; }
        }
        #pasang-gate {
          transition: transform 1.4s cubic-bezier(.76, 0, .24, 1);
        }
        #pasang-gate.open {
          transform: translateY(-104%);
          pointer-events: none;
        }
        .rip {
          position: relative;
          overflow: hidden;
        }
        .rip span.r {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, .45);
          transform: scale(0);
          animation: pasangRipple .7s ease-out forwards;
          pointer-events: none;
        }
        @keyframes pasangRipple {
          to { transform: scale(4); opacity: 0; }
        }
        .pasang-ring {
          position: absolute;
          inset: 0;
          border: 1px solid #2F6F7E;
          border-radius: 999px 999px 0 0;
          animation: pasangRing 5s ease-out infinite;
          animation-delay: var(--d, 0s);
          pointer-events: none;
        }
        @keyframes pasangRing {
          from { transform: scale(1); opacity: .6; }
          to { transform: scale(1.35); opacity: 0; }
        }
        .pasang-tick {
          animation: pasangTick .45s cubic-bezier(.2, .8, .2, 1);
        }
        @keyframes pasangTick {
          from { transform: translateY(-35%); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        #pasang-water {
          height: calc(10% + var(--p, 0) * 78%);
          transition: height .5s ease-out;
        }
        .pasang-pimg {
          opacity: 0;
          transform: scale(1.06);
          transition: opacity .95s ease, transform 5s ease-out;
        }
        .pasang-pimg.on {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>

      {/* Top Tide Progress Bar */}
      <div
        ref={tideBarRef}
        className="fixed top-0 left-0 h-[3px] bg-[#E8806A] z-40 origin-left"
        style={{ width: '100%', transform: 'scaleX(0)' }}
      />

      {/* Demo Back & Order Toolbar */}
      {onBackToLanding && (
        <div className="fixed top-4 left-4 z-[60] flex items-center gap-2">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4EEE3]/90 hover:bg-[#F4EEE3] text-[#0F3A4A] border border-[#BFDCD6] backdrop-blur-md text-xs font-medium tracking-wider transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E8806A]" />
            <span>Kembali</span>
          </button>
        </div>
      )}

      {onOrderViaWhatsApp && (
        <div className="fixed top-4 right-4 z-[60]">
          <button
            onClick={onOrderViaWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F3A4A] hover:bg-[#2F6F7E] text-[#F4EEE3] font-medium text-xs tracking-wider transition-all shadow-md cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan Tema Ini</span>
          </button>
        </div>
      )}

      {/* ============ GATE COVER ============ */}
      {!isCoverDismissed && (
        <div
          id="pasang-gate"
          className={`fixed inset-0 z-50 bg-[#F4EEE3] ${isCoverOpen ? 'open' : ''}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-between text-center px-8 pt-14 pb-40 overflow-hidden">
            <p className="text-[11px] tracking-[.4em] uppercase text-[#2F6F7E] font-semibold">
              Undangan Pernikahan
            </p>
            <div>
              {!hideGuestName && (
                <div
                  id="guest-badge"
                  className="inline-flex flex-col items-center bg-[#E3F0EC] border border-[#BFDCD6] rounded-3xl px-8 py-4 mb-8"
                >
                  <p className="text-[10px] tracking-[.3em] uppercase text-[#2F6F7E]">Kepada Yth.</p>
                  <p id="guest-name" className="font-display-pasang font-medium text-2xl mt-1">
                    {guestName}
                  </p>
                </div>
              )}
              <h1 className="font-display-pasang font-light text-[56px] leading-[.95] tracking-tight">
                <span data-bind="brideName">{brideName}</span>
                <br />
                <span className="font-serif-pasang italic text-[#E8806A] text-4xl">dan</span>
                <br />
                <span data-bind="groomName">{groomName}</span>
              </h1>
            </div>

            <button
              id="btn-open-invitation"
              onPointerDown={triggerRipple}
              onClick={handleOpenCover}
              className="rip relative z-10 flex items-center gap-3 bg-[#0F3A4A] text-[#F4EEE3] rounded-full pl-7 pr-2.5 py-2.5 text-sm font-semibold tracking-wide active:scale-95 transition-transform cursor-pointer"
            >
              Buka Undangan
              <span className="grid place-items-center w-10 h-10 rounded-full bg-[#E8806A] text-[#0F3A4A]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </span>
            </button>
          </div>

          {/* 3 Layered Animated Gate Waves */}
          <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 inset-x-0 h-full opacity-40">
              <svg className="pasang-wave slow" viewBox="0 0 1200 60" preserveAspectRatio="none">
                <path d="M0 30Q150 5 300 30T600 30T900 30T1200 30V60H0Z" fill="#BFDCD6" />
              </svg>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-28 opacity-70">
              <svg className="pasang-wave rev" viewBox="0 0 1200 60" preserveAspectRatio="none">
                <path d="M0 30Q150 55 300 30T600 30T900 30T1200 30V60H0Z" fill="#2F6F7E" />
              </svg>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-16">
              <svg className="pasang-wave" viewBox="0 0 1200 60" preserveAspectRatio="none">
                <path d="M0 30Q150 5 300 30T600 30T900 30T1200 30V60H0Z" fill="#0F3A4A" />
              </svg>
            </div>
          </div>

          {/* Trailing Wave Edge under Gate */}
          <div className="absolute top-full inset-x-0 h-10 overflow-hidden -mt-px pointer-events-none">
            <svg className="pasang-wave" viewBox="0 0 1200 40" preserveAspectRatio="none">
              <path d="M0 0H1200V10Q1050 38 900 10T600 10T300 10T0 10Z" fill="#0F3A4A" />
            </svg>
          </div>
        </div>
      )}

      {/* ============ LAYOUT SPLIT DESKTOP (LG) ============ */}
      <div className="lg:grid lg:grid-cols-2 min-h-screen">

        {/* ===== KIRI (Sticky Desktop Interactive Tide Stage) ===== */}
        <aside
          id="left-panel"
          ref={leftPanelRef}
          onMouseMove={handleLeftMouseMove}
          onMouseLeave={handleLeftMouseLeave}
          className="hidden lg:flex sticky top-0 h-screen items-center justify-center bg-[#EAE1D0] relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 20%, #F4EEE3 0, transparent 55%)' }}
          />

          {/* Ambient rising sea bubbles in left panel */}
          <span className="pasang-bub w-3 h-3 left-[14%]" style={{ ['--t' as string]: '13s', ['--x' as string]: '16px' }} />
          <span className="pasang-bub w-5 h-5 left-[82%]" style={{ ['--t' as string]: '16s', ['--dl' as string]: '-5s', ['--x' as string]: '-20px' }} />
          <span className="pasang-bub w-2.5 h-2.5 left-[24%]" style={{ ['--t' as string]: '11s', ['--dl' as string]: '-2s', ['--x' as string]: '12px' }} />
          <span className="pasang-bub w-4 h-4 left-[72%]" style={{ ['--t' as string]: '14s', ['--dl' as string]: '-8s', ['--x' as string]: '-14px' }} />

          {/* Top Left & Right Indicators */}
          <div className="absolute top-8 left-10 right-10 flex items-center justify-between text-[11px] tracking-[.28em] uppercase text-[#2F6F7E] font-semibold">
            <span>Bab {activeChapter.num} / 10</span>
            <span className="bg-[#E3F0EC] border border-[#BFDCD6] px-3 py-1 rounded-full text-[#0F3A4A]">
              Pasang {tidePercent}%
            </span>
          </div>

          <div className="relative flex flex-col items-center">
            {/* 3D Mouse Parallax Capsule with Multi-Photo Stack & Rising Water */}
            <div
              id="parallax"
              ref={parallaxRef}
              className="relative w-[320px] xl:w-[340px] h-[460px] xl:h-[500px] rounded-t-full rounded-b-[170px] overflow-hidden shadow-[0_30px_60px_rgba(15,58,74,.25)] border-[8px] border-[#F4EEE3] transition-transform duration-300 ease-out bg-[#BFDCD6]"
            >
              {/* Stacked Section Photos that cross-fade smoothly */}
              {stageChapters.map((chap) => (
                <img
                  key={chap.id}
                  src={chap.img}
                  alt={chap.title}
                  className={`pasang-pimg absolute inset-0 w-full h-full object-cover ${
                    activeNav === chap.id ? 'on' : ''
                  }`}
                />
              ))}

              {/* Rising Tide Water Level following scroll */}
              <div id="pasang-water" ref={waterRef} className="absolute inset-x-0 bottom-0 pointer-events-none">
                <div className="absolute -top-5 inset-x-0 h-6 overflow-hidden">
                  <svg className="pasang-wave rev opacity-60" viewBox="0 0 1200 40" preserveAspectRatio="none">
                    <path d="M0 20Q150 38 300 20T600 20T900 20T1200 20V40H0Z" fill="rgba(47,111,126,.5)" />
                  </svg>
                </div>
                <div className="absolute -top-4 inset-x-0 h-6 overflow-hidden">
                  <svg className="pasang-wave" viewBox="0 0 1200 40" preserveAspectRatio="none">
                    <path d="M0 20Q150 0 300 20T600 20T900 20T1200 20V40H0Z" fill="rgba(15,58,74,.58)" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-[#0F3A4A]/58 backdrop-blur-[1px]" />
              </div>

              {/* Active Chapter Overlay Pill inside bottom of capsule */}
              <div className="absolute bottom-6 inset-x-6 text-center text-[#F4EEE3] z-10 pointer-events-none">
                <p className="font-serif-pasang italic text-xl drop-shadow">{activeChapter.title}</p>
                <p className="text-[10px] tracking-[.2em] uppercase text-[#BFDCD6] mt-0.5">{activeChapter.sub}</p>
              </div>
            </div>

            <p className="font-display-pasang font-light text-4xl mt-7 tracking-tight">
              <span data-bind="brideName">{brideName}</span>{' '}
              <span className="font-serif-pasang italic text-[#E8806A] text-3xl">&amp;</span>{' '}
              <span data-bind="groomName">{groomName}</span>
            </p>
            <p className="text-[11px] tracking-[.35em] uppercase text-[#2F6F7E] mt-2" data-bind="eventDateFormatted">
              {eventDateFormatted}
            </p>

            {/* Quick Interactive Section Dots on Left Panel */}
            <div className="flex items-center gap-2 mt-5">
              {[
                { id: 'hero', label: 'Sampul' },
                { id: 'mempelai', label: 'Mempelai' },
                { id: 'acara', label: 'Acara' },
                { id: 'galeri', label: 'Galeri' },
                { id: 'kasih', label: 'Kasih' },
                { id: 'rsvp', label: 'RSVP' },
                { id: 'wishes', label: 'Doa' },
              ].map((dot) => (
                <a
                  key={dot.id}
                  href={`#pasang-${dot.id}`}
                  onClick={(e) => scrollToSection(e, dot.id)}
                  title={dot.label}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeNav === dot.id ? 'w-7 bg-[#E8806A]' : 'w-2 bg-[#2F6F7E]/35 hover:bg-[#2F6F7E]'
                  }`}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* ===== KANAN (Scrollable Main Card) ===== */}
        <div className="bg-[#EAE1D0]">
          <main className="w-full max-w-[480px] mx-auto min-h-screen relative bg-[#F4EEE3] lg:shadow-2xl overflow-x-hidden">

            {/* 1. HERO */}
            <section
              id="pasang-hero"
              className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 py-20 overflow-hidden"
            >
              <span className="pasang-bub w-3 h-3 left-[12%]" style={{ ['--t' as string]: '11s', ['--x' as string]: '14px' }} />
              <span className="pasang-bub w-5 h-5 left-[78%]" style={{ ['--t' as string]: '14s', ['--dl' as string]: '-4s', ['--x' as string]: '-18px' }} />
              <span className="pasang-bub w-2 h-2 left-[50%]" style={{ ['--t' as string]: '9s', ['--dl' as string]: '-2s', ['--x' as string]: '10px' }} />
              <span className="pasang-bub w-4 h-4 left-[30%]" style={{ ['--t' as string]: '16s', ['--dl' as string]: '-9s', ['--x' as string]: '-12px' }} />

              <p
                className="rise text-[11px] tracking-[.4em] uppercase text-[#2F6F7E] font-semibold"
                style={{ ['--d' as string]: '.2s' }}
              >
                Kami akan menikah
              </p>

              <div
                className="lg:hidden rise mt-8 relative w-40 h-56 rounded-t-full rounded-b-[80px] overflow-hidden border-[5px] border-[#F4EEE3] shadow-xl bg-[#BFDCD6]"
                style={{ ['--d' as string]: '.4s' }}
              >
                {isVideoUrl(heroImage) ? (
                  <video src={heroImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img
                    data-slot="heroImage"
                    src={heroImage}
                    alt="Foto mempelai"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>

              <h2 className="font-display-pasang font-light text-[76px] leading-[.88] tracking-tight mt-8 lg:mt-4">
                <span className="rise" style={{ ['--d' as string]: '.55s' }} data-bind="brideName">
                  {brideName}
                </span>
                <br />
                <span className="rise font-serif-pasang italic text-[#E8806A] text-5xl" style={{ ['--d' as string]: '.7s' }}>
                  dan
                </span>
                <br />
                <span className="rise" style={{ ['--d' as string]: '.85s' }} data-bind="groomName">
                  {groomName}
                </span>
              </h2>

              <p
                className="rise font-serif-pasang italic text-2xl mt-8"
                style={{ ['--d' as string]: '1.1s' }}
                data-bind="eventDateFormatted"
              >
                {eventDateFormatted}
              </p>

              <a
                href="#pasang-pesan"
                onClick={(e) => scrollToSection(e, 'pesan')}
                className="rise absolute bottom-7 flex flex-col items-center gap-1 text-[10px] tracking-[.3em] uppercase text-[#2F6F7E]"
                style={{ ['--d' as string]: '1.4s' }}
              >
                Gulir
                <svg
                  className="animate-bounce"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </a>
            </section>

            {/* 2. QUOTE / PESAN */}
            <section id="pasang-pesan" className="relative bg-[#0F3A4A] text-[#F4EEE3] px-9 pt-28 pb-24 text-center">
              <div className="absolute -top-px inset-x-0 h-12 overflow-hidden rotate-180">
                <svg className="pasang-wave slow" viewBox="0 0 1200 60" preserveAspectRatio="none">
                  <path d="M0 30Q150 5 300 30T600 30T900 30T1200 30V60H0Z" fill="#0F3A4A" />
                </svg>
              </div>
              <p className="reveal font-serif-pasang italic text-[27px] leading-snug" data-bind="quoteText">
                {quoteText}
              </p>
              <p
                className="reveal text-[11px] tracking-[.3em] uppercase text-[#BFDCD6] mt-7"
                style={{ ['--d' as string]: '.15s' }}
                data-bind="quoteSource"
              >
                {quoteSource}
              </p>
            </section>

            {/* 3. MEMPELAI */}
            <section id="pasang-mempelai" className="px-8 py-24">
              <div className="reveal text-center mb-14">
                <p className="text-[11px] tracking-[.35em] uppercase text-[#2F6F7E] font-semibold">Mempelai</p>
                <h3 className="font-display-pasang font-light text-4xl mt-3 tracking-tight">
                  Dua arus, <span className="font-serif-pasang italic text-[#E8806A]">satu muara</span>
                </h3>
              </div>

              <div className="reveal flex flex-col items-center text-center">
                <div className="pasang-pebble overflow-hidden w-56 h-64 border-[6px] border-[#F4EEE3] shadow-xl bg-[#BFDCD6]">
                  {isVideoUrl(bridePortrait) ? (
                    <video src={bridePortrait} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img data-slot="bridePortrait" src={bridePortrait} alt="Mempelai wanita" className="w-full h-full object-cover" />
                  )}
                </div>
                <h4 className="font-display-pasang font-medium text-3xl mt-7 tracking-tight" data-bind="brideFullName">
                  {brideFullName}
                </h4>
                <p className="text-sm text-[#0F3A4A]/65 mt-2 max-w-[260px] leading-relaxed" data-bind="brideParents">
                  {brideParents}
                </p>
              </div>

              <div className="reveal my-12 flex items-center gap-4">
                <span className="flex-1 h-px bg-[#2F6F7E]/30" />
                <span className="font-serif-pasang italic text-4xl text-[#E8806A]">&amp;</span>
                <span className="flex-1 h-px bg-[#2F6F7E]/30" />
              </div>

              <div className="reveal flex flex-col items-center text-center">
                <div className="pasang-pebble b overflow-hidden w-56 h-64 border-[6px] border-[#F4EEE3] shadow-xl bg-[#BFDCD6]">
                  {isVideoUrl(groomPortrait) ? (
                    <video src={groomPortrait} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img data-slot="groomPortrait" src={groomPortrait} alt="Mempelai pria" className="w-full h-full object-cover" />
                  )}
                </div>
                <h4 className="font-display-pasang font-medium text-3xl mt-7 tracking-tight" data-bind="groomFullName">
                  {groomFullName}
                </h4>
                <p className="text-sm text-[#0F3A4A]/65 mt-2 max-w-[260px] leading-relaxed" data-bind="groomParents">
                  {groomParents}
                </p>
              </div>
            </section>

            {/* 4. COUNTDOWN */}
            <section id="pasang-countdown" className="px-6 py-16 bg-[#E3F0EC] text-center">
              <p className="reveal text-[11px] tracking-[.35em] uppercase text-[#2F6F7E] font-semibold">
                Air pasang menuju hari itu
              </p>
              <div className="reveal mt-7 grid grid-cols-4 gap-2" style={{ ['--d' as string]: '.1s' }}>
                <div className="bg-[#F4EEE3] rounded-2xl py-5 overflow-hidden">
                  <p key={days} className="font-display-pasang font-light text-5xl leading-none tabular-nums pasang-tick">
                    {days}
                  </p>
                  <p className="text-[10px] tracking-[.2em] uppercase text-[#2F6F7E] mt-2">Hari</p>
                </div>
                <div className="bg-[#F4EEE3] rounded-2xl py-5 overflow-hidden">
                  <p key={hours} className="font-display-pasang font-light text-5xl leading-none tabular-nums pasang-tick">
                    {hours}
                  </p>
                  <p className="text-[10px] tracking-[.2em] uppercase text-[#2F6F7E] mt-2">Jam</p>
                </div>
                <div className="bg-[#F4EEE3] rounded-2xl py-5 overflow-hidden">
                  <p key={mins} className="font-display-pasang font-light text-5xl leading-none tabular-nums pasang-tick">
                    {mins}
                  </p>
                  <p className="text-[10px] tracking-[.2em] uppercase text-[#2F6F7E] mt-2">Menit</p>
                </div>
                <div className="bg-[#0F3A4A] text-[#F4EEE3] rounded-2xl py-5 overflow-hidden">
                  <p key={secs} className="font-display-pasang font-light text-5xl leading-none tabular-nums pasang-tick">
                    {secs}
                  </p>
                  <p className="text-[10px] tracking-[.2em] uppercase text-[#BFDCD6] mt-2">Detik</p>
                </div>
              </div>
            </section>

            {/* 5. ACARA */}
            <section id="pasang-acara" className="px-6 py-24">
              <div className="reveal text-center mb-10">
                <p className="text-[11px] tracking-[.35em] uppercase text-[#2F6F7E] font-semibold">Acara</p>
                <h3 className="font-serif-pasang italic text-4xl mt-3" data-bind="eventDateFormatted">
                  {eventDateFormatted}
                </h3>
              </div>

              <div className="reveal rounded-3xl bg-[#E3F0EC] border border-[#BFDCD6] overflow-hidden">
                <div className="bg-[#0F3A4A] text-[#F4EEE3] px-7 py-4 flex items-center justify-between">
                  <span className="font-display-pasang font-medium text-xl">Akad Nikah</span>
                  <span className="text-[10px] tracking-[.3em] uppercase text-[#BFDCD6]">Pagi</span>
                </div>
                <div className="px-7 py-6">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="w-4 h-4" />
                    <span data-bind="akadTime">{akadTime}</span>
                  </p>
                  <p className="text-sm text-[#0F3A4A]/70 mt-3 leading-relaxed" data-bind="akadVenue">
                    {akadVenue}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerDown={triggerRipple}
                    data-bind="mapsUrl"
                    className="rip inline-flex items-center gap-2 mt-5 rounded-full bg-[#0F3A4A] text-[#F4EEE3] px-5 py-2.5 text-xs font-semibold"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Buka Peta
                  </a>
                </div>
              </div>

              <div
                className="reveal rounded-3xl bg-[#E3F0EC] border border-[#BFDCD6] overflow-hidden mt-5"
                style={{ ['--d' as string]: '.1s' }}
              >
                <div className="bg-[#E8806A] text-[#0F3A4A] px-7 py-4 flex items-center justify-between">
                  <span className="font-display-pasang font-medium text-xl">Resepsi</span>
                  <span className="text-[10px] tracking-[.3em] uppercase">Siang</span>
                </div>
                <div className="px-7 py-6">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="w-4 h-4" />
                    <span data-bind="resepsiTime">{resepsiTime}</span>
                  </p>
                  <p className="text-sm text-[#0F3A4A]/70 mt-3 leading-relaxed" data-bind="resepsiVenue">
                    {resepsiVenue}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerDown={triggerRipple}
                    data-bind="mapsUrl"
                    className="rip inline-flex items-center gap-2 mt-5 rounded-full bg-[#0F3A4A] text-[#F4EEE3] px-5 py-2.5 text-xs font-semibold"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Buka Peta
                  </a>
                </div>
              </div>
            </section>

            {/* 6. GALERI (dengan efek .wipe clip-path reveal) */}
            <section id="pasang-galeri" className="px-6 py-20 bg-[#EAE1D0]">
              <div className="reveal text-center mb-10">
                <p className="text-[11px] tracking-[.35em] uppercase text-[#2F6F7E] font-semibold">Galeri</p>
                <h3 className="font-serif-pasang italic text-4xl mt-3">Yang dibawa ombak</h3>
                <p className="text-xs text-[#0F3A4A]/50 mt-2">ketuk foto untuk memperbesar</p>
              </div>
              <div className="grid grid-cols-2 gap-3 items-start">
                <div className="space-y-3">
                  <img
                    data-slot="galleryImages"
                    src={galleryImages[0]}
                    alt="Galeri 1"
                    onClick={() => setSelectedLightboxImg(galleryImages[0])}
                    className="wipe w-full aspect-[3/4] object-cover rounded-2xl bg-[#BFDCD6] cursor-zoom-in"
                  />
                  <img
                    data-slot="galleryImages"
                    src={galleryImages[2]}
                    alt="Galeri 3"
                    onClick={() => setSelectedLightboxImg(galleryImages[2])}
                    className="wipe w-full aspect-square object-cover rounded-2xl bg-[#BFDCD6] cursor-zoom-in"
                    style={{ ['--d' as string]: '.15s' }}
                  />
                </div>
                <div className="space-y-3 mt-10">
                  <img
                    data-slot="galleryImages"
                    src={galleryImages[1]}
                    alt="Galeri 2"
                    onClick={() => setSelectedLightboxImg(galleryImages[1])}
                    className="wipe w-full aspect-square object-cover rounded-2xl bg-[#BFDCD6] cursor-zoom-in"
                    style={{ ['--d' as string]: '.08s' }}
                  />
                  <img
                    data-slot="galleryImages"
                    src={galleryImages[3]}
                    alt="Galeri 4"
                    onClick={() => setSelectedLightboxImg(galleryImages[3])}
                    className="wipe w-full aspect-[3/4] object-cover rounded-2xl bg-[#BFDCD6] cursor-zoom-in"
                    style={{ ['--d' as string]: '.2s' }}
                  />
                </div>
              </div>
            </section>

            {/* 7. TANDA KASIH */}
            <section id="pasang-kasih" className="px-7 py-24">
              <div className="reveal text-center mb-9">
                <p className="text-[11px] tracking-[.35em] uppercase text-[#2F6F7E] font-semibold">Tanda kasih</p>
                <p className="text-sm text-[#0F3A4A]/65 mt-4 leading-relaxed max-w-[300px] mx-auto">
                  Doa dan kehadiranmu sudah lebih dari cukup. Bila ingin berbagi kebahagiaan, kami terima dengan syukur.
                </p>
              </div>
              <div
                className="reveal relative rounded-3xl bg-[#0F3A4A] text-[#F4EEE3] p-7 overflow-hidden"
                style={{ ['--d' as string]: '.1s' }}
              >
                <div className="absolute -bottom-2 inset-x-0 h-10 opacity-30 overflow-hidden pointer-events-none">
                  <svg className="pasang-wave" viewBox="0 0 1200 60" preserveAspectRatio="none">
                    <path d="M0 30Q150 5 300 30T600 30T900 30T1200 30V60H0Z" fill="#BFDCD6" />
                  </svg>
                </div>
                <p className="relative text-[10px] tracking-[.3em] uppercase text-[#BFDCD6]" data-bind="bankName">
                  {bankName}
                </p>
                <p
                  id="acc-num"
                  className="relative font-display-pasang font-light text-[34px] tracking-wide mt-3 tabular-nums"
                  data-bind="accountNumber"
                >
                  {accountNumber}
                </p>
                <p className="relative text-sm text-[#F4EEE3]/70 mt-1">
                  a.n. <span data-bind="accountHolder">{accountHolder}</span>
                </p>
                <button
                  id="btn-copy-acc"
                  onPointerDown={triggerRipple}
                  onClick={handleCopyAccount}
                  className="rip relative mt-6 inline-flex items-center gap-2 bg-[#E8806A] text-[#0F3A4A] rounded-full px-5 py-2.5 text-sm font-semibold active:scale-95 transition-transform cursor-pointer"
                >
                  {isCopied('pasang-acc') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {isCopied('pasang-acc') ? 'Nomor tersalin' : 'Salin nomor'}
                </button>
              </div>
            </section>

            {/* 8. RSVP FORM */}
            <section id="pasang-rsvp" className="px-7 py-24 bg-[#E3F0EC]">
              <div className="reveal text-center mb-9">
                <p className="text-[11px] tracking-[.35em] uppercase text-[#2F6F7E] font-semibold">Kehadiran</p>
                <h3 className="font-display-pasang font-light text-4xl mt-3 tracking-tight">
                  Berlabuh <span className="font-serif-pasang italic text-[#E8806A]">bersama kami</span>
                </h3>
              </div>

              {isRsvpSuccess ? (
                <div className="reveal rounded-3xl bg-[#F4EEE3] border border-[#BFDCD6] p-8 text-center">
                  <Check className="w-10 h-10 text-[#2F6F7E] mx-auto mb-3" />
                  <h4 className="font-display-pasang font-medium text-2xl">Terima Kasih</h4>
                  <p className="text-xs text-[#0F3A4A]/70 mt-2">Konfirmasi kehadiran Anda telah kami catat.</p>
                </div>
              ) : (
                <form
                  onSubmit={submitRsvp}
                  className="reveal rounded-3xl bg-[#F4EEE3] border border-[#BFDCD6] p-7 space-y-4"
                  style={{ ['--d' as string]: '.1s' }}
                >
                  <div>
                    <label className="block text-[10px] tracking-[.25em] uppercase text-[#2F6F7E] font-semibold mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="w-full bg-white border border-[#BFDCD6] rounded-2xl px-4 py-3 text-sm text-[#0F3A4A] focus:outline-none focus:border-[#0F3A4A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRsvpAttendance('hadir')}
                      className={`py-2.5 text-xs rounded-2xl font-semibold border transition-all cursor-pointer ${
                        rsvpAttendance === 'hadir'
                          ? 'bg-[#0F3A4A] text-[#F4EEE3] border-[#0F3A4A]'
                          : 'border-[#BFDCD6] text-[#0F3A4A]/70 hover:text-[#0F3A4A]'
                      }`}
                    >
                      Akan Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpAttendance('tidak_hadir')}
                      className={`py-2.5 text-xs rounded-2xl font-semibold border transition-all cursor-pointer ${
                        rsvpAttendance === 'tidak_hadir'
                          ? 'bg-[#0F3A4A] text-[#F4EEE3] border-[#0F3A4A]'
                          : 'border-[#BFDCD6] text-[#0F3A4A]/70 hover:text-[#0F3A4A]'
                      }`}
                    >
                      Berhalangan
                    </button>
                  </div>

                  {rsvpAttendance === 'hadir' && (
                    <div>
                      <label className="block text-[10px] tracking-[.25em] uppercase text-[#2F6F7E] font-semibold mb-1.5">
                        Jumlah Tamu
                      </label>
                      <select
                        value={rsvpGuestCount}
                        onChange={(e) => setRsvpGuestCount(e.target.value)}
                        className="w-full bg-white border border-[#BFDCD6] rounded-2xl px-4 py-3 text-sm text-[#0F3A4A] focus:outline-none focus:border-[#0F3A4A]"
                      >
                        <option value="1">1 Orang</option>
                        <option value="2">2 Orang</option>
                        <option value="3">3 Orang</option>
                        <option value="4">4 Orang</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    onPointerDown={triggerRipple}
                    className="rip w-full bg-[#0F3A4A] hover:bg-[#2F6F7E] text-[#F4EEE3] font-semibold py-3.5 rounded-full text-xs tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Kirim Konfirmasi
                  </button>
                </form>
              )}
            </section>

            {/* 9. BUKU TAMU / KOMENTAR */}
            <section id="pasang-wishes" className="px-7 py-24">
              <div className="reveal text-center mb-9">
                <p className="text-[11px] tracking-[.35em] uppercase text-[#2F6F7E] font-semibold">Ucapan &amp; Doa</p>
                <h3 className="font-display-pasang font-light text-4xl mt-3 tracking-tight">
                  Pesan di <span className="font-serif-pasang italic text-[#E8806A]">tepi pantai</span>
                </h3>
                <p className="text-xs text-[#0F3A4A]/60 mt-1">{wishes.length} ucapan selamat telah diterima</p>
              </div>

              <form
                onSubmit={submitWish}
                className="reveal rounded-3xl bg-[#E3F0EC] border border-[#BFDCD6] p-6 space-y-3.5"
                style={{ ['--d' as string]: '.1s' }}
              >
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full bg-[#F4EEE3] border border-[#BFDCD6] rounded-2xl px-4 py-3 text-sm text-[#0F3A4A] focus:outline-none focus:border-[#0F3A4A]"
                />
                <textarea
                  required
                  rows={3}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Tuliskan ucapan dan doa tulus Anda..."
                  className="w-full bg-[#F4EEE3] border border-[#BFDCD6] rounded-2xl px-4 py-3 text-sm text-[#0F3A4A] focus:outline-none focus:border-[#0F3A4A] resize-none"
                />
                <button
                  type="submit"
                  onPointerDown={triggerRipple}
                  className="rip w-full inline-flex items-center justify-center gap-2 bg-[#0F3A4A] hover:bg-[#2F6F7E] text-[#F4EEE3] font-semibold py-3 rounded-full text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Ucapan
                </button>
              </form>

              <div className="reveal mt-8 space-y-4 max-h-[440px] overflow-y-auto pr-1" style={{ ['--d' as string]: '.15s' }}>
                {wishes.map((w, idx) => (
                  <div key={idx} className="bg-[#E3F0EC]/70 border border-[#BFDCD6] rounded-3xl p-4 flex gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#0F3A4A] text-[#F4EEE3] font-display-pasang font-semibold text-sm flex items-center justify-center shrink-0">
                      {(w.name.trim().charAt(0) || '?').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F3A4A]">{w.name}</p>
                      <p className="text-xs text-[#0F3A4A]/80 mt-1 leading-relaxed break-words">{w.message}</p>
                      {w.time && <p className="text-[10px] text-[#2F6F7E] mt-2">{w.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 10. PENUTUP */}
            <section id="pasang-penutup" className="px-8 pt-6 pb-36 text-center">
              <div className="reveal relative inline-block mx-auto">
                <span className="pasang-ring" />
                <span className="pasang-ring" style={{ ['--d' as string]: '1.6s' }} />
                <span className="pasang-ring" style={{ ['--d' as string]: '3.2s' }} />
                <div className="relative w-52 h-64 rounded-t-full overflow-hidden border-[5px] border-[#F4EEE3] shadow-xl bg-[#BFDCD6]">
                  {isVideoUrl(closingImage) ? (
                    <video src={closingImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img data-slot="closingImage" src={closingImage} alt="Foto penutup" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              <p className="reveal font-serif-pasang italic text-xl mt-10" style={{ ['--d' as string]: '.1s' }}>
                Sampai bertemu di tepi pantai kebahagiaan kami
              </p>
              <p
                className="reveal font-display-pasang font-light text-5xl mt-4 tracking-tight"
                style={{ ['--d' as string]: '.15s' }}
              >
                <span data-bind="brideName">{brideName}</span>{' '}
                <span className="font-serif-pasang italic text-[#E8806A] text-4xl">&amp;</span>{' '}
                <span data-bind="groomName">{groomName}</span>
              </p>
            </section>
          </main>
        </div>
      </div>

      {/* LIGHTBOX */}
      {selectedLightboxImg && (
        <div
          onClick={() => setSelectedLightboxImg(null)}
          className="fixed inset-0 z-[70] bg-[#0F3A4A]/90 backdrop-blur-sm grid place-items-center p-6"
        >
          <img src={selectedLightboxImg} alt="" className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl" />
          <button
            onClick={() => setSelectedLightboxImg(null)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-[#F4EEE3] text-[#0F3A4A] grid place-items-center cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* TOAST */}
      <div
        className={`fixed left-1/2 bottom-24 z-[80] -translate-x-1/2 pointer-events-none transition-all duration-300 bg-[#0F3A4A] text-[#F4EEE3] text-sm px-5 py-3 rounded-full shadow-xl ${
          showCopyToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        Nomor rekening berhasil disalin
      </div>

      {/* AUDIO BUTTON */}
      <button
        id="audio-toggle-btn"
        onClick={toggleAudio}
        aria-label="Putar atau jeda musik"
        className={`fixed z-40 bottom-16 lg:bottom-5 right-5 w-12 h-12 rounded-full bg-[#0F3A4A] text-[#F4EEE3] grid place-items-center shadow-lg transition-opacity duration-500 cursor-pointer ${
          isCoverOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {isPlayingAudio ? <Disc3 className="w-5 h-5 animate-spin text-[#E8806A]" /> : <Disc className="w-5 h-5" />}
      </button>

      {/* Mobile Bottom Dock Navigation */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#F4EEE3]/95 backdrop-blur-md border border-[#BFDCD6] rounded-full px-4 py-2 flex items-center gap-3.5 text-[11px] font-medium text-[#0F3A4A] shadow-xl">
        {[
          { id: 'hero', label: 'Sampul' },
          { id: 'mempelai', label: 'Mempelai' },
          { id: 'acara', label: 'Acara' },
          { id: 'galeri', label: 'Galeri' },
          { id: 'rsvp', label: 'RSVP' },
          { id: 'wishes', label: 'Doa' },
        ].map((item) => (
          <a
            key={item.id}
            href={`#pasang-${item.id}`}
            onClick={(e) => scrollToSection(e, item.id)}
            className={activeNav === item.id ? 'text-[#E8806A] font-bold' : ''}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};
