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
  Send,
  X
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

interface LanteraTemplateProps {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

const FIREFLIES_DATA = [
  { left: '12%', top: '18%', t: '8.5s', b: '2.4s', x: '28px', y: '-42px', delay: '-1.2s' },
  { left: '78%', top: '14%', t: '11.2s', b: '3.1s', x: '-34px', y: '-38px', delay: '-3.5s' },
  { left: '24%', top: '42%', t: '9.4s', b: '2.8s', x: '22px', y: '-55px', delay: '-0.8s' },
  { left: '68%', top: '48%', t: '12.6s', b: '3.6s', x: '-26px', y: '-44px', delay: '-4.2s' },
  { left: '45%', top: '26%', t: '10.1s', b: '2.2s', x: '32px', y: '-30px', delay: '-2.1s' },
  { left: '16%', top: '72%', t: '13.4s', b: '3.9s', x: '38px', y: '-48px', delay: '-5.0s' },
  { left: '84%', top: '68%', t: '9.8s', b: '2.6s', x: '-30px', y: '-52px', delay: '-1.7s' },
  { left: '52%', top: '82%', t: '11.8s', b: '3.3s', x: '18px', y: '-60px', delay: '-2.9s' },
  { left: '34%', top: '60%', t: '8.9s', b: '2.5s', x: '-24px', y: '-36px', delay: '-4.6s' },
  { left: '62%', top: '22%', t: '14.0s', b: '4.1s', x: '26px', y: '-40px', delay: '-3.1s' },
  { left: '8%', top: '50%', t: '10.5s', b: '2.9s', x: '34px', y: '-32px', delay: '-0.4s' },
  { left: '91%', top: '36%', t: '12.1s', b: '3.4s', x: '-28px', y: '-46px', delay: '-5.4s' },
  { left: '40%', top: '12%', t: '9.2s', b: '2.7s', x: '20px', y: '-38px', delay: '-1.9s' },
  { left: '72%', top: '86%', t: '10.9s', b: '3.0s', x: '-22px', y: '-50px', delay: '-3.8s' },
  { left: '28%', top: '88%', t: '13.0s', b: '3.7s', x: '30px', y: '-42px', delay: '-2.5s' },
  { left: '56%', top: '44%', t: '8.7s', b: '2.3s', x: '-18px', y: '-34px', delay: '-4.9s' },
];

export const LanteraTemplate: React.FC<LanteraTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);

  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isCoverDismissed, setIsCoverDismissed] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Custom data mapping
  const brideName = customData?.brideName || 'Nadia';
  const brideFullName = customData?.brideFullName || 'Nadia Safitri Rahmawati';
  const brideParents = customData?.brideParents || 'Putri dari Bapak Hendra Wijaya & Ibu Sri Lestari';
  const groomName = customData?.groomName || 'Raka';
  const groomFullName = customData?.groomFullName || 'Raka Aditya Pratama';
  const groomParents = customData?.groomParents || 'Putra dari Bapak Dedi Kurniawan & Ibu Ratna Dewi';

  const brideInitial = (brideName.trim().charAt(0) || 'N').toUpperCase();
  const groomInitial = (groomName.trim().charAt(0) || 'R').toUpperCase();

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

  const songTitle = customData?.songTitle || 'Golden Hour Instrumental';
  const audioUrl = customData?.audioUrl || '';

  // Media slots with curated high-fashion dark/warm portraits
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

  // All 8 photos tracked by the reactive panel (matching prototype-lantera.html's `main img[data-slot]` observer)
  const stageSlides = useMemo(
    () => [
      { src: heroImage, cap: 'No. 01 · Sampul', chapTitle: 'Malam Cahaya', chapSub: 'Awal dari janji suci yang abadi', sec: 'hero' },
      { src: bridePortrait, cap: 'No. 02 · Mempelai Wanita', chapTitle: brideName, chapSub: 'Keanggunan dalam teduh lentera', sec: 'couple' },
      { src: groomPortrait, cap: 'No. 03 · Mempelai Pria', chapTitle: groomName, chapSub: 'Ketulusan langkah menuju satu muara', sec: 'couple' },
      { src: galleryImages[0], cap: 'No. 04 · Rangkaian Acara', chapTitle: 'Janji Suci', chapSub: eventDateFormatted, sec: 'event' },
      { src: galleryImages[1], cap: 'No. 05 · Potongan Cahaya I', chapTitle: 'Potongan Cahaya', chapSub: 'Setiap detik yang terekam hangat', sec: 'gallery' },
      { src: galleryImages[2], cap: 'No. 06 · Potongan Cahaya II', chapTitle: 'Ruang Kenangan', chapSub: 'Dua cerita, satu cahaya', sec: 'gallery' },
      { src: galleryImages[3], cap: 'No. 07 · Tanda Kasih', chapTitle: 'Doa & Restu', chapSub: 'Kehadiranmu adalah cahaya bagi kami', sec: 'gift' },
      { src: closingImage, cap: 'No. 08 · Penutup', chapTitle: 'Terima Kasih', chapSub: `${brideName} & ${groomName}`, sec: 'closing' },
    ],
    [heroImage, bridePortrait, groomPortrait, galleryImages, closingImage, brideName, groomName, eventDateFormatted]
  );

  // Hooks
  const { guestName, hideGuestName } = useGuestRecipient('Nama Tamu');
  const { days, hours, mins, secs } = useCountdown(countdownIsoDate);
  const { isPlayingAudio, toggleAudio } = useAudioController(songTitle, audioUrl);
  const { copyText, isCopied } = useClipboardCopy(2200);

  const defaultInitialWishes = useMemo(
    () => [
      {
        name: 'Keluarga Besar Wijaya',
        message: 'Semoga menjadi keluarga sakinah, mawaddah, warahmah. Bahagia selamanya dalam lindungan-Nya.',
        time: '2 hari lalu',
      },
      {
        name: 'Fikri & Amanda',
        message: 'Selamat Nadia dan Raka! Semoga seluruh rangkaian acara dilancarkan sampai hari bahagia.',
        time: '1 hari lalu',
      },
      {
        name: 'Dimas Satria',
        message: 'Barakallahu lakuma wa baraka alaikuma wa jama’a bainakuma fii khoir.',
        time: '5 jam lalu',
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

  // Lock body scroll while gate cover is closed
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

  // Smooth 60fps pointer glow follower using CSS custom properties
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.setProperty('--mx', `${e.clientX}px`);
      glowRef.current.style.setProperty('--my', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Scroll-reveal observer (.reveal & .line) + Scroll-spy for sections and photos
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // 1. Reveal observer
    const revealEls = root.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealEls.forEach((el) => revealObs.observe(el));

    // 2. Scroll-spy using getBoundingClientRect for 100% precision
    const secIds = ['hero', 'quote', 'couple', 'countdown', 'event', 'gallery', 'gift', 'rsvp', 'wishes', 'closing'];
    const sectionToSlideIdx: Record<string, number> = {
      hero: 0,
      quote: 0,
      couple: 1,
      countdown: 2,
      event: 3,
      gallery: 4,
      gift: 6,
      rsvp: 6,
      wishes: 7,
      closing: 7,
    };

    const handleScrollSpy = () => {
      const targetY = window.innerHeight * 0.42;
      let bestId = 'hero';
      let bestDist = Infinity;

      for (const id of secIds) {
        const el = document.getElementById(`lantera-${id}`);
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

      // Map 'quote' to 'hero' in nav if quote has no nav item
      const navId = bestId === 'quote' ? 'hero' : bestId === 'closing' ? 'wishes' : bestId;
      setActiveNav(navId);

      // Check tracked images inside main card for fine-grained photo switching
      const trackedImgs = root.querySelectorAll('[data-slide-idx]');
      let foundImgIdx = -1;
      trackedImgs.forEach((imgEl) => {
        const rect = imgEl.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.25) {
          const idxAttr = imgEl.getAttribute('data-slide-idx');
          if (idxAttr !== null) foundImgIdx = parseInt(idxAttr, 10);
        }
      });

      if (foundImgIdx >= 0) {
        setActivePhotoIdx(foundImgIdx);
      } else {
        setActivePhotoIdx(sectionToSlideIdx[bestId] ?? 0);
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => {
      revealObs.disconnect();
      window.removeEventListener('scroll', handleScrollSpy);
    };
  }, [isCoverDismissed]);

  // Open Gate with exact circular clip-path centered on the button
  const handleOpenCover = () => {
    if (gateRef.current && openBtnRef.current) {
      const r = openBtnRef.current.getBoundingClientRect();
      gateRef.current.style.setProperty('--cx', `${r.left + r.width / 2}px`);
      gateRef.current.style.setProperty('--cy', `${r.top + r.height / 2}px`);
    }
    setIsCoverOpen(true);
    if (!isPlayingAudio) {
      toggleAudio();
    }
    setTimeout(() => {
      setIsCoverDismissed(true);
    }, 1550);
  };

  const handleCopyAccount = () => {
    copyText(accountNumber.replace(/\s/g, ''), 'lantera-acc');
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2200);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(`lantera-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeSlide = stageSlides[activePhotoIdx] || stageSlides[0];

  return (
    <div
      ref={rootRef}
      className={`lantera-root min-h-screen bg-[#0E0E0D] text-[#F3EFE6] antialiased selection:bg-[#C9A96E] selection:text-[#0E0E0D] relative ${
        isCoverOpen ? 'go' : ''
      } ${isPlayingAudio ? 'on-music' : ''}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

        .lantera-root {
          font-family: 'Inter', system-ui, sans-serif;
          background: #0E0E0D;
          color: #F3EFE6;
        }
        .lantera-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        #lantera-glow {
          background: radial-gradient(circle 340px at var(--mx, 50%) var(--my, 35%), rgba(201, 169, 110, 0.15), transparent 70%);
        }
        .lantera-shimmer {
          background: linear-gradient(100deg, #F3EFE6 20%, #C9A96E 45%, #F3EFE6 70%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: lanteraSh 6s linear infinite;
        }
        @keyframes lanteraSh {
          to { background-position: -250% 0; }
        }
        .lantera-fly {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #E8CF9A;
          box-shadow: 0 0 8px 2px rgba(232, 207, 154, 0.65);
          animation: lanteraDrift var(--t, 9s) ease-in-out infinite alternate, lanteraBlink var(--b, 3s) ease-in-out infinite;
        }
        @keyframes lanteraDrift {
          to { transform: translate(var(--x, 30px), var(--y, -40px)); }
        }
        @keyframes lanteraBlink {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; }
        }
        .lantera-root .reveal {
          opacity: 0;
          transform: translateY(26px);
          transition: opacity 1s ease, transform 1.1s cubic-bezier(.2, .8, .2, 1);
          transition-delay: var(--d, 0s);
        }
        .lantera-root .reveal.in {
          opacity: 1;
          transform: none;
        }
        .lantera-root .rise {
          display: inline-block;
          opacity: 0;
          transform: translateY(60%);
          filter: blur(6px);
        }
        .lantera-root.go .rise {
          animation: lanteraRise 1.2s cubic-bezier(.2, .8, .2, 1) forwards;
          animation-delay: var(--d, 0s);
        }
        @keyframes lanteraRise {
          to { opacity: 1; transform: none; filter: none; }
        }
        #lantera-gate {
          clip-path: circle(150% at var(--cx, 50%) var(--cy, 70%));
          transition: clip-path 1.5s cubic-bezier(.65, 0, .25, 1);
        }
        #lantera-gate.open {
          clip-path: circle(0% at var(--cx, 50%) var(--cy, 70%));
          pointer-events: none;
        }
        .lantera-lamp {
          animation: lanteraLamp 3.5s ease-in-out infinite;
        }
        @keyframes lanteraLamp {
          50% { transform: scale(1.14); opacity: 0.85; }
        }
        .lantera-kb {
          animation: lanteraKb 14s ease-in-out infinite alternate;
        }
        @keyframes lanteraKb {
          to { transform: scale(1.1) translate(-1.5%, -1%); }
        }
        .lantera-line {
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 1.6s cubic-bezier(.6, 0, .2, 1);
        }
        .lantera-root .in .lantera-line,
        .lantera-root .lantera-line.in {
          transform: scaleY(1);
        }
        .lantera-sheen {
          position: relative;
          overflow: hidden;
        }
        .lantera-sheen::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(243, 239, 230, 0.12) 50%, transparent 65%);
          transform: translateX(-120%);
          animation: lanteraSweep 5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes lanteraSweep {
          60%, 100% { transform: translateX(120%); }
        }
        .lantera-pimg {
          opacity: 0;
          transform: scale(1.07);
          transition: opacity 1.1s ease, transform 6s ease-out;
        }
        .lantera-pimg.on {
          opacity: 1;
          transform: scale(1);
        }
        .lantera-nav a {
          transition: color 0.3s ease, padding 0.3s ease;
        }
        .lantera-nav a.on {
          color: #C9A96E;
          padding-left: 20px;
        }
        .lantera-nav a.on::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 12px;
          height: 1px;
          background: #C9A96E;
          box-shadow: 0 0 8px rgba(201, 169, 110, 0.8);
        }
        .lantera-tick {
          animation: lanteraTick 0.45s cubic-bezier(.2, .8, .2, 1);
        }
        @keyframes lanteraTick {
          from { transform: translateY(-30%); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
      `}</style>

      {/* Interactive Pointer Radial Lantern Glow */}
      <div
        id="lantera-glow"
        ref={glowRef}
        className="fixed inset-0 z-30 pointer-events-none mix-blend-screen"
      />

      {/* Top Demo Toolbar */}
      {onBackToLanding && (
        <div className="fixed top-4 left-4 z-[60] flex items-center gap-2">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#171716]/90 hover:bg-[#1F1E1C] text-[#F3EFE6] border border-[#C9A96E]/30 backdrop-blur-md text-xs tracking-wider transition-all shadow-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>Kembali</span>
          </button>
        </div>
      )}

      {onOrderViaWhatsApp && (
        <div className="fixed top-4 right-4 z-[60]">
          <button
            onClick={onOrderViaWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A96E] hover:bg-[#b8985d] text-[#0E0E0D] font-medium text-xs tracking-wider transition-all shadow-lg cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan Tema Ini</span>
          </button>
        </div>
      )}

      {/* ============ GATE COVER: Lampu Menyala dengan Iris Clip-Path ============ */}
      {!isCoverDismissed && (
        <div
          id="lantera-gate"
          ref={gateRef}
          className={`fixed inset-0 z-50 bg-[#0E0E0D] flex flex-col items-center justify-center text-center px-8 overflow-hidden ${
            isCoverOpen ? 'open' : ''
          }`}
        >
          {/* Ambient fireflies on Gate */}
          <div className="absolute inset-0 pointer-events-none">
            {FIREFLIES_DATA.slice(0, 8).map((f, i) => (
              <span
                key={i}
                className="lantera-fly"
                style={{
                  left: f.left,
                  top: f.top,
                  ['--t' as string]: f.t,
                  ['--b' as string]: f.b,
                  ['--x' as string]: f.x,
                  ['--y' as string]: f.y,
                  animationDelay: f.delay,
                }}
              />
            ))}
          </div>

          <div
            className="absolute top-[28%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full lantera-lamp pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,169,110,.28), transparent 65%)' }}
          />

          <div className="relative z-10">
            <p className="text-[11px] tracking-[.45em] uppercase text-[#C9A96E]">Undangan Pernikahan</p>
            <h1 className="lantera-serif font-light text-[60px] leading-[.95] mt-6">
              <span data-bind="brideName">{brideName}</span>
              <br />
              <span className="italic text-[#C9A96E] text-4xl">&amp;</span>
              <br />
              <span data-bind="groomName">{groomName}</span>
            </h1>

            {!hideGuestName && (
              <div
                id="guest-badge"
                className="mt-9 border border-[#C9A96E]/30 bg-[#171716]/50 backdrop-blur-sm rounded-sm px-8 py-4 inline-block"
              >
                <p className="text-[10px] tracking-[.3em] uppercase text-[#9B968B]">Kepada Yth.</p>
                <p id="guest-name" className="lantera-serif text-2xl mt-1">
                  {guestName}
                </p>
              </div>
            )}

            <div className="mt-9">
              <button
                id="btn-open-invitation"
                ref={openBtnRef}
                onClick={handleOpenCover}
                className="inline-flex items-center gap-3 border border-[#C9A96E] text-[#C9A96E] rounded-full pl-7 pr-2.5 py-2.5 text-sm tracking-wide hover:bg-[#C9A96E] hover:text-[#0E0E0D] transition-colors cursor-pointer shadow-[0_0_30px_rgba(201,169,110,0.2)]"
              >
                Buka Undangan
                <span className="grid place-items-center w-9 h-9 rounded-full bg-[#C9A96E] text-[#0E0E0D]">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3c-2 3-4 4.5-4 8a4 4 0 008 0c0-3.5-2-5-4-8z" />
                    <path d="M12 19v2" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DESKTOP SPLIT / 3-COLUMN LAYOUT (LG & XL) ============ */}
      <div className="lg:grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_480px_1fr] min-h-screen">

        {/* SISI KIRI (Sticky Desktop Stage: Info + Reactive Chapter Backdrop + Navigasi) */}
        <aside className="hidden lg:flex sticky top-0 h-screen flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-[#C9A96E]/10">
          {/* Subtle Reactive Ambient Background Image in Left Panel */}
          <div className="absolute inset-0 pointer-events-none">
            {stageSlides.map((slide, idx) => (
              <img
                key={idx}
                src={slide.src}
                alt=""
                className={`lantera-pimg absolute inset-0 w-full h-full object-cover filter blur-[3px] brightness-[0.22] ${
                  activePhotoIdx === idx ? 'on' : ''
                }`}
              />
            ))}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 30% 40%, rgba(201,169,110,0.14), rgba(14,14,13,0.92) 75%)',
              }}
            />
            {/* Ambient fireflies in left panel */}
            {FIREFLIES_DATA.slice(0, 6).map((f, i) => (
              <span
                key={i}
                className="lantera-fly"
                style={{
                  left: f.left,
                  top: f.top,
                  ['--t' as string]: f.t,
                  ['--b' as string]: f.b,
                  ['--x' as string]: f.x,
                  ['--y' as string]: f.y,
                  animationDelay: f.delay,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <p className="text-[11px] tracking-[.4em] uppercase text-[#C9A96E]">The Wedding of</p>
            <span className="text-[10px] tracking-[.3em] uppercase text-[#C9A96E]/70 border border-[#C9A96E]/25 px-3 py-1 rounded-full">
              {brideInitial} &amp; {groomInitial}
            </span>
          </div>

          <div className="relative z-10 my-auto py-6">
            <h2 className="lantera-serif font-light text-[68px] xl:text-[82px] leading-[.9] lantera-shimmer">
              <span data-bind="brideName">{brideName}</span>
              <br />
              <span className="italic text-[48px] xl:text-[54px]">&amp;</span>{' '}
              <span data-bind="groomName">{groomName}</span>
            </h2>
            <p className="text-xs tracking-[.3em] uppercase text-[#9B968B] mt-6" data-bind="eventDateFormatted">
              {eventDateFormatted}
            </p>

            {/* Live Reactive Chapter Box on Left Panel */}
            <div className="mt-8 pt-6 border-t border-[#C9A96E]/20 max-w-xs">
              <p className="text-[10px] tracking-[.35em] uppercase text-[#C9A96E] transition-all duration-500">
                {activeSlide.cap}
              </p>
              <p
                key={activeSlide.chapTitle}
                className="lantera-serif italic text-2xl text-[#F3EFE6] mt-1 transition-all duration-500"
              >
                {activeSlide.chapTitle}
              </p>
              <p className="text-xs text-[#9B968B] mt-1 leading-relaxed">{activeSlide.chapSub}</p>
            </div>

            {/* On LG screens (<1280px where right column is hidden), show a compact arched reactive preview */}
            <div className="hidden lg:block xl:hidden mt-6 w-40 aspect-[3/4] border border-[#C9A96E]/40 p-1.5 relative overflow-hidden bg-[#1F1E1C]">
              <div className="relative w-full h-full overflow-hidden">
                {stageSlides.map((slide, idx) => (
                  <img
                    key={idx}
                    src={slide.src}
                    alt=""
                    className={`lantera-pimg absolute inset-0 w-full h-full object-cover ${
                      activePhotoIdx === idx ? 'on' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <nav className="lantera-nav relative z-10 flex flex-col gap-3 text-sm text-[#9B968B]">
            {[
              { id: 'hero', label: 'Sampul' },
              { id: 'couple', label: 'Mempelai' },
              { id: 'countdown', label: 'Hitung Mundur' },
              { id: 'event', label: 'Rangkaian Acara' },
              { id: 'gallery', label: 'Galeri' },
              { id: 'gift', label: 'Tanda Kasih' },
              { id: 'rsvp', label: 'Konfirmasi Kehadiran' },
              { id: 'wishes', label: 'Ucapan & Doa' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#lantera-${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`relative hover:text-[#F3EFE6] ${activeNav === item.id ? 'on' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* TENGAH: Kartu Undangan Utama */}
        <main className="w-full max-w-[480px] mx-auto min-h-screen relative bg-[#171716] lg:shadow-[0_0_80px_rgba(0,0,0,.6)] overflow-x-hidden">

          {/* 1. HERO */}
          <section
            id="lantera-hero"
            className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 sm:px-8 py-20 overflow-hidden"
          >
            {/* 16 Drifting & Blinking Fireflies */}
            <div className="absolute inset-0 pointer-events-none">
              {FIREFLIES_DATA.map((f, i) => (
                <span
                  key={i}
                  className="lantera-fly"
                  style={{
                    left: f.left,
                    top: f.top,
                    ['--t' as string]: f.t,
                    ['--b' as string]: f.b,
                    ['--x' as string]: f.x,
                    ['--y' as string]: f.y,
                    animationDelay: f.delay,
                  }}
                />
              ))}
            </div>

            {/* Ambient Radial Golden Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none opacity-40 mix-blend-screen"
              style={{
                background: 'radial-gradient(circle, rgba(201,169,110,0.35) 0%, rgba(201,169,110,0.08) 50%, transparent 70%)',
              }}
            />

            {/* Top Ornamental Header */}
            <div
              className="rise flex items-center gap-3 text-[#C9A96E]/70 text-xs tracking-[0.4em] uppercase mb-4"
              style={{ ['--d' as string]: '.15s' }}
            >
              <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
              <span>Undangan Pernikahan</span>
              <span className="w-8 h-[1px] bg-[#C9A96E]/40" />
            </div>

            <p
              className="rise text-[11px] tracking-[.45em] uppercase text-[#C9A96E] font-medium"
              style={{ ['--d' as string]: '.25s' }}
            >
              Kami akan menikah
            </p>

            {/* Main Central Arched Portrait Frame (Always Visible on all viewports) */}
            <div
              className="rise relative mt-7 mb-6 w-52 sm:w-60 h-72 sm:h-80 rounded-t-full p-2 border border-[#C9A96E]/50 shadow-[0_0_50px_rgba(201,169,110,0.18)]"
              style={{ ['--d' as string]: '.4s' }}
            >
              {/* Outer decorative ring */}
              <div className="absolute -inset-1.5 rounded-t-full border border-[#C9A96E]/20 pointer-events-none" />

              <div className="w-full h-full rounded-t-full overflow-hidden bg-[#1F1E1C] relative group">
                {isVideoUrl(heroImage) ? (
                  <video src={heroImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img
                    data-slot="heroImage"
                    data-slide-idx="0"
                    src={heroImage}
                    alt="Foto mempelai"
                    className="lantera-kb w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#171716]/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating Date Badge inside bottom of photo */}
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#0E0E0D]/80 backdrop-blur-md border border-[#C9A96E]/40 text-[10px] tracking-widest text-[#C9A96E] uppercase">
                    {eventDateFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* Couple Typography */}
            <h2 className="lantera-serif font-light text-[68px] sm:text-[76px] leading-[.88] mt-2 lantera-shimmer">
              <span className="rise" style={{ ['--d' as string]: '.6s' }} data-bind="brideName">
                {brideName}
              </span>
              <br />
              <span className="rise italic text-4xl sm:text-5xl text-[#C9A96E]" style={{ ['--d' as string]: '.75s' }}>
                &amp;
              </span>
              <br />
              <span className="rise" style={{ ['--d' as string]: '.9s' }} data-bind="groomName">
                {groomName}
              </span>
            </h2>

            {/* Special Guest Card */}
            {!hideGuestName && (
              <div
                className="rise mt-7 px-6 py-3 rounded-lg border border-[#C9A96E]/25 bg-[#1F1E1C]/60 backdrop-blur-sm max-w-xs"
                style={{ ['--d' as string]: '1.1s' }}
              >
                <p className="text-[10px] tracking-[.3em] uppercase text-[#9B968B]">Spesial Disampaikan Kepada:</p>
                <p className="lantera-serif text-xl sm:text-2xl text-[#F3EFE6] mt-0.5 font-light">
                  {guestName}
                </p>
              </div>
            )}

            {/* Venue & Date summary */}
            <div
              className="rise mt-6 flex items-center gap-2 text-xs text-[#9B968B]"
              style={{ ['--d' as string]: '1.25s' }}
            >
              <span className="text-[#C9A96E]">✦</span>
              <span>{akadVenue.split(',')[0]}</span>
              <span className="text-[#C9A96E]/40">·</span>
              <span className="lantera-serif italic text-sm text-[#F3EFE6]">{eventDateFormatted}</span>
            </div>

            {/* Scroll Indicator */}
            <div
              className="rise mt-10 flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]/60"
              style={{ ['--d' as string]: '1.4s' }}
            >
              <span>Gulir ke Bawah</span>
              <div className="w-[1px] h-8 bg-gradient-to-b from-[#C9A96E] to-transparent animate-pulse" />
            </div>
          </section>

          {/* 2. QUOTE */}
          <section id="lantera-quote" className="px-9 py-24 text-center border-y border-[#C9A96E]/15 bg-[#1F1E1C]">
            <p className="reveal text-[#C9A96E] text-xl">✦</p>
            <p
              className="reveal lantera-serif italic font-light text-[28px] leading-snug mt-6"
              style={{ ['--d' as string]: '.1s' }}
              data-bind="quoteText"
            >
              {quoteText}
            </p>
            <p
              className="reveal text-[11px] tracking-[.3em] uppercase text-[#9B968B] mt-7"
              style={{ ['--d' as string]: '.2s' }}
              data-bind="quoteSource"
            >
              {quoteSource}
            </p>
          </section>

          {/* 3. MEMPELAI */}
          <section id="lantera-couple" className="px-8 py-24">
            <div className="reveal text-center mb-14">
              <p className="text-[11px] tracking-[.4em] uppercase text-[#C9A96E]">Mempelai</p>
              <h3 className="lantera-serif font-light text-4xl mt-3">
                Dua cerita, <span className="italic text-[#C9A96E]">satu cahaya</span>
              </h3>
            </div>

            <div className="reveal flex flex-col items-center text-center">
              <div className="w-56 h-72 rounded-t-full overflow-hidden border border-[#C9A96E]/50 p-1.5">
                <div className="w-full h-full rounded-t-full overflow-hidden bg-[#1F1E1C]">
                  {isVideoUrl(bridePortrait) ? (
                    <video src={bridePortrait} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img
                      data-slot="bridePortrait"
                      data-slide-idx="1"
                      src={bridePortrait}
                      alt="Mempelai wanita"
                      className="lantera-kb w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <h4 className="lantera-serif text-[34px] mt-7 leading-tight" data-bind="brideFullName">
                {brideFullName}
              </h4>
              <p className="text-sm text-[#9B968B] mt-2 max-w-[260px] leading-relaxed" data-bind="brideParents">
                {brideParents}
              </p>
            </div>

            <p className="reveal text-center lantera-serif italic text-5xl text-[#C9A96E] my-12">&amp;</p>

            <div className="reveal flex flex-col items-center text-center">
              <div className="w-56 h-72 rounded-t-full overflow-hidden border border-[#C9A96E]/50 p-1.5">
                <div className="w-full h-full rounded-t-full overflow-hidden bg-[#1F1E1C]">
                  {isVideoUrl(groomPortrait) ? (
                    <video src={groomPortrait} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img
                      data-slot="groomPortrait"
                      data-slide-idx="2"
                      src={groomPortrait}
                      alt="Mempelai pria"
                      className="lantera-kb w-full h-full object-cover"
                      style={{ animationDelay: '-5s' }}
                    />
                  )}
                </div>
              </div>
              <h4 className="lantera-serif text-[34px] mt-7 leading-tight" data-bind="groomFullName">
                {groomFullName}
              </h4>
              <p className="text-sm text-[#9B968B] mt-2 max-w-[260px] leading-relaxed" data-bind="groomParents">
                {groomParents}
              </p>
            </div>
          </section>

          {/* 4. COUNTDOWN */}
          <section id="lantera-countdown" className="px-6 py-16 bg-[#1F1E1C] text-center border-y border-[#C9A96E]/15">
            <p className="reveal text-[11px] tracking-[.4em] uppercase text-[#C9A96E]">Menuju hari bahagia</p>
            <div className="reveal mt-8 grid grid-cols-4 divide-x divide-[#C9A96E]/20" style={{ ['--d' as string]: '.1s' }}>
              <div>
                <p key={days} className="lantera-serif font-light text-[54px] leading-none tabular-nums lantera-tick">
                  {days}
                </p>
                <p className="text-[10px] tracking-[.25em] uppercase text-[#9B968B] mt-2">Hari</p>
              </div>
              <div>
                <p key={hours} className="lantera-serif font-light text-[54px] leading-none tabular-nums lantera-tick">
                  {hours}
                </p>
                <p className="text-[10px] tracking-[.25em] uppercase text-[#9B968B] mt-2">Jam</p>
              </div>
              <div>
                <p key={mins} className="lantera-serif font-light text-[54px] leading-none tabular-nums lantera-tick">
                  {mins}
                </p>
                <p className="text-[10px] tracking-[.25em] uppercase text-[#9B968B] mt-2">Menit</p>
              </div>
              <div>
                <p key={secs} className="lantera-serif font-light text-[54px] leading-none tabular-nums text-[#C9A96E] lantera-tick">
                  {secs}
                </p>
                <p className="text-[10px] tracking-[.25em] uppercase text-[#9B968B] mt-2">Detik</p>
              </div>
            </div>
          </section>

          {/* 5. ACARA: Timeline Garis Menyala */}
          <section id="lantera-event" className="px-8 py-24">
            <div className="reveal text-center mb-12">
              <p className="text-[11px] tracking-[.4em] uppercase text-[#C9A96E]">Rangkaian acara</p>
              <h3 className="lantera-serif italic font-light text-4xl mt-3" data-bind="eventDateFormatted">
                {eventDateFormatted}
              </h3>
            </div>

            <div className="relative pl-9">
              <div className="reveal absolute left-[5px] top-2 bottom-2 w-px bg-[#C9A96E]/60 lantera-line" />

              <div className="reveal relative pb-12">
                <span className="absolute -left-9 top-2 w-[11px] h-[11px] rounded-full bg-[#C9A96E] shadow-[0_0_14px_3px_rgba(201,169,110,.6)]" />
                <p className="text-[10px] tracking-[.3em] uppercase text-[#C9A96E]">Pertama</p>
                <p className="lantera-serif text-[34px] leading-tight mt-1">Akad Nikah</p>
                <p className="flex items-center gap-2 text-sm text-[#F3EFE6]/80 mt-3">
                  <Clock className="w-4 h-4 text-[#C9A96E]" />
                  <span data-bind="akadTime">{akadTime}</span>
                </p>
                <p className="text-sm text-[#9B968B] mt-2 leading-relaxed" data-bind="akadVenue">
                  {akadVenue}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-bind="mapsUrl"
                  className="inline-flex items-center gap-2 mt-5 border border-[#C9A96E]/60 text-[#C9A96E] px-5 py-2.5 text-xs tracking-wide hover:bg-[#C9A96E] hover:text-[#0E0E0D] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Buka Peta
                </a>
              </div>

              <div className="reveal relative" style={{ ['--d' as string]: '.15s' }}>
                <span className="absolute -left-9 top-2 w-[11px] h-[11px] rounded-full bg-[#C9A96E] shadow-[0_0_14px_3px_rgba(201,169,110,.6)]" />
                <p className="text-[10px] tracking-[.3em] uppercase text-[#C9A96E]">Kemudian</p>
                <p className="lantera-serif text-[34px] leading-tight mt-1">Resepsi</p>
                <p className="flex items-center gap-2 text-sm text-[#F3EFE6]/80 mt-3">
                  <Clock className="w-4 h-4 text-[#C9A96E]" />
                  <span data-bind="resepsiTime">{resepsiTime}</span>
                </p>
                <p className="text-sm text-[#9B968B] mt-2 leading-relaxed" data-bind="resepsiVenue">
                  {resepsiVenue}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-bind="mapsUrl"
                  className="inline-flex items-center gap-2 mt-5 border border-[#C9A96E]/60 text-[#C9A96E] px-5 py-2.5 text-xs tracking-wide hover:bg-[#C9A96E] hover:text-[#0E0E0D] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Buka Peta
                </a>
              </div>
            </div>
          </section>

          {/* 6. GALERI */}
          <section id="lantera-gallery" className="px-6 py-20 bg-[#1F1E1C] border-y border-[#C9A96E]/15">
            <div className="reveal text-center mb-10">
              <p className="text-[11px] tracking-[.4em] uppercase text-[#C9A96E]">Galeri</p>
              <h3 className="lantera-serif italic font-light text-4xl mt-3">Potongan cahaya</h3>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div
                onClick={() => setLightboxImg(galleryImages[0])}
                className="reveal col-span-4 overflow-hidden cursor-zoom-in border border-[#C9A96E]/20"
              >
                <img
                  data-slot="galleryImages"
                  data-slide-idx="3"
                  src={galleryImages[0]}
                  alt="Galeri 1"
                  className="lantera-kb w-full aspect-[4/5] object-cover bg-[#171716]"
                />
              </div>
              <div
                onClick={() => setLightboxImg(galleryImages[1])}
                className="reveal col-span-2 overflow-hidden mt-10 cursor-zoom-in border border-[#C9A96E]/20"
                style={{ ['--d' as string]: '.1s' }}
              >
                <img
                  data-slot="galleryImages"
                  data-slide-idx="4"
                  src={galleryImages[1]}
                  alt="Galeri 2"
                  className="lantera-kb w-full h-full object-cover bg-[#171716]"
                />
              </div>
              <div
                onClick={() => setLightboxImg(galleryImages[2])}
                className="reveal col-span-2 overflow-hidden -mt-10 cursor-zoom-in border border-[#C9A96E]/20"
                style={{ ['--d' as string]: '.1s' }}
              >
                <img
                  data-slot="galleryImages"
                  data-slide-idx="5"
                  src={galleryImages[2]}
                  alt="Galeri 3"
                  className="lantera-kb w-full aspect-[3/4] object-cover bg-[#171716]"
                />
              </div>
              <div
                onClick={() => setLightboxImg(galleryImages[3])}
                className="reveal col-span-4 overflow-hidden cursor-zoom-in border border-[#C9A96E]/20"
                style={{ ['--d' as string]: '.15s' }}
              >
                <img
                  data-slot="galleryImages"
                  data-slide-idx="6"
                  src={galleryImages[3]}
                  alt="Galeri 4"
                  className="lantera-kb w-full aspect-[4/3] object-cover bg-[#171716]"
                />
              </div>
            </div>
          </section>

          {/* 7. TANDA KASIH */}
          <section id="lantera-gift" className="px-7 py-24">
            <div className="reveal text-center mb-9">
              <p className="text-[11px] tracking-[.4em] uppercase text-[#C9A96E]">Tanda kasih</p>
              <p className="text-sm text-[#9B968B] mt-4 leading-relaxed max-w-[300px] mx-auto">
                Doa dan kehadiranmu sudah lebih dari cukup. Bila ingin berbagi kebahagiaan, kami terima dengan syukur.
              </p>
            </div>
            <div
              className="reveal lantera-sheen border border-[#C9A96E]/50 bg-[#1F1E1C] p-7"
              style={{ ['--d' as string]: '.1s' }}
            >
              <p className="text-[10px] tracking-[.3em] uppercase text-[#C9A96E]" data-bind="bankName">
                {bankName}
              </p>
              <p
                id="acc-num"
                className="lantera-serif text-[36px] tracking-wide mt-3 tabular-nums"
                data-bind="accountNumber"
              >
                {accountNumber}
              </p>
              <p className="text-sm text-[#9B968B] mt-1">
                a.n. <span className="text-[#F3EFE6]" data-bind="accountHolder">{accountHolder}</span>
              </p>
              <button
                id="btn-copy-acc"
                onClick={handleCopyAccount}
                className="mt-6 inline-flex items-center gap-2 bg-[#C9A96E] text-[#0E0E0D] px-5 py-2.5 text-sm font-medium active:scale-95 transition-transform cursor-pointer"
              >
                {isCopied('lantera-acc') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopied('lantera-acc') ? 'Nomor Tersalin' : 'Salin nomor'}
              </button>
            </div>
          </section>

          {/* 8. RSVP FORM */}
          <section id="lantera-rsvp" className="px-7 py-24 bg-[#1F1E1C] border-y border-[#C9A96E]/15">
            <div className="reveal text-center mb-9">
              <p className="text-[11px] tracking-[.4em] uppercase text-[#C9A96E]">Konfirmasi Kehadiran</p>
              <h3 className="lantera-serif font-light text-4xl mt-3">
                Hadir dalam <span className="italic text-[#C9A96E]">cahaya kami</span>
              </h3>
            </div>

            {isRsvpSuccess ? (
              <div className="reveal border border-[#C9A96E]/40 bg-[#171716] p-8 text-center">
                <Check className="w-9 h-9 text-[#C9A96E] mx-auto mb-3" />
                <p className="lantera-serif text-3xl text-[#F3EFE6]">Terima Kasih</p>
                <p className="text-xs text-[#9B968B] mt-2">Konfirmasi kehadiran Anda telah kami terima.</p>
              </div>
            ) : (
              <form
                onSubmit={submitRsvp}
                className="reveal border border-[#C9A96E]/30 bg-[#171716] p-7 space-y-5"
                style={{ ['--d' as string]: '.1s' }}
              >
                <div>
                  <label className="block text-[10px] tracking-[.3em] uppercase text-[#C9A96E] mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Tuliskan nama Anda"
                    className="w-full bg-[#1F1E1C] border border-[#C9A96E]/30 px-4 py-3 text-sm text-[#F3EFE6] focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[.3em] uppercase text-[#C9A96E] mb-2">
                    Konfirmasi
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRsvpAttendance('hadir')}
                      className={`py-2.5 text-xs tracking-wider border transition-colors cursor-pointer ${
                        rsvpAttendance === 'hadir'
                          ? 'bg-[#C9A96E] text-[#0E0E0D] border-[#C9A96E] font-medium'
                          : 'border-[#C9A96E]/30 text-[#9B968B] hover:text-[#F3EFE6]'
                      }`}
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpAttendance('tidak_hadir')}
                      className={`py-2.5 text-xs tracking-wider border transition-colors cursor-pointer ${
                        rsvpAttendance === 'tidak_hadir'
                          ? 'bg-[#C9A96E] text-[#0E0E0D] border-[#C9A96E] font-medium'
                          : 'border-[#C9A96E]/30 text-[#9B968B] hover:text-[#F3EFE6]'
                      }`}
                    >
                      Berhalangan
                    </button>
                  </div>
                </div>

                {rsvpAttendance === 'hadir' && (
                  <div>
                    <label className="block text-[10px] tracking-[.3em] uppercase text-[#C9A96E] mb-2">
                      Jumlah Tamu
                    </label>
                    <select
                      value={rsvpGuestCount}
                      onChange={(e) => setRsvpGuestCount(e.target.value)}
                      className="w-full bg-[#1F1E1C] border border-[#C9A96E]/30 px-4 py-3 text-sm text-[#F3EFE6] focus:outline-none focus:border-[#C9A96E]"
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
                  className="w-full bg-[#C9A96E] text-[#0E0E0D] py-3 text-xs font-medium tracking-[.2em] uppercase hover:bg-[#b8985d] transition-colors cursor-pointer"
                >
                  Kirim Konfirmasi
                </button>
              </form>
            )}
          </section>

          {/* 9. BUKU TAMU / KOMENTAR */}
          <section id="lantera-wishes" className="px-7 py-24">
            <div className="reveal text-center mb-9">
              <p className="text-[11px] tracking-[.4em] uppercase text-[#C9A96E]">Ucapan &amp; Doa</p>
              <h3 className="lantera-serif font-light text-4xl mt-3">
                Untaian <span className="italic text-[#C9A96E]">doa tulus</span>
              </h3>
              <p className="text-xs text-[#9B968B] mt-2">{wishes.length} doa telah tertulis</p>
            </div>

            <form
              onSubmit={submitWish}
              className="reveal border border-[#C9A96E]/30 bg-[#1F1E1C] p-6 space-y-4"
              style={{ ['--d' as string]: '.1s' }}
            >
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nama Anda"
                className="w-full bg-[#171716] border border-[#C9A96E]/30 px-4 py-2.5 text-sm text-[#F3EFE6] focus:outline-none focus:border-[#C9A96E]"
              />
              <textarea
                required
                rows={3}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Tuliskan ucapan dan doa untuk kedua mempelai..."
                className="w-full bg-[#171716] border border-[#C9A96E]/30 px-4 py-2.5 text-sm text-[#F3EFE6] focus:outline-none focus:border-[#C9A96E] resize-none"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A96E] text-[#0E0E0D] py-2.5 text-xs font-medium tracking-[.2em] uppercase hover:bg-[#b8985d] transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim Ucapan
              </button>
            </form>

            <div className="reveal mt-8 space-y-4 max-h-[440px] overflow-y-auto pr-1" style={{ ['--d' as string]: '.15s' }}>
              {wishes.map((w, idx) => (
                <div key={idx} className="border border-[#C9A96E]/20 bg-[#1F1E1C]/80 p-5 flex gap-3.5">
                  <div className="w-9 h-9 rounded-full border border-[#C9A96E]/40 bg-[#C9A96E]/10 text-[#C9A96E] lantera-serif text-lg flex items-center justify-center shrink-0">
                    {(w.name.trim().charAt(0) || '✦').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#F3EFE6]">{w.name}</p>
                    <p className="text-xs text-[#F3EFE6]/80 mt-1.5 leading-relaxed break-words">{w.message}</p>
                    {w.time && <p className="text-[10px] text-[#9B968B] mt-2">{w.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10. CLOSING */}
          <section id="lantera-closing" className="px-8 pt-4 pb-36 text-center">
            <div className="reveal mx-auto w-52 h-64 rounded-t-full overflow-hidden border border-[#C9A96E]/50 p-1.5">
              <div className="w-full h-full rounded-t-full overflow-hidden bg-[#1F1E1C]">
                {isVideoUrl(closingImage) ? (
                  <video src={closingImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img
                    data-slot="closingImage"
                    data-slide-idx="7"
                    src={closingImage}
                    alt="Foto penutup"
                    className="lantera-kb w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <p className="reveal lantera-serif italic text-xl mt-10 text-[#F3EFE6]/85" style={{ ['--d' as string]: '.1s' }}>
              Terima kasih telah menjadi bagian dari cahaya kami
            </p>
            <p
              className="reveal lantera-serif font-light text-[56px] leading-none mt-5 lantera-shimmer"
              style={{ ['--d' as string]: '.15s' }}
            >
              <span data-bind="brideName">{brideName}</span> <span className="italic text-4xl">&amp;</span>{' '}
              <span data-bind="groomName">{groomName}</span>
            </p>
          </section>
        </main>

        {/* KANAN (XL Sticky Reactive Portrait Frame — Foto berganti mengikuti bagian yang dibaca) */}
        <aside className="hidden xl:flex sticky top-0 h-screen items-center justify-center p-14 border-l border-[#C9A96E]/10">
          <div className="relative w-full max-w-[360px]">
            <div className="relative aspect-[3/4] overflow-hidden border border-[#C9A96E]/40 p-2 shadow-[0_25px_70px_rgba(0,0,0,0.75)]">
              <div className="relative w-full h-full overflow-hidden bg-[#1F1E1C]">
                {stageSlides.map((slide, idx) => (
                  <img
                    key={idx}
                    src={slide.src}
                    alt={slide.cap}
                    className={`lantera-pimg absolute inset-0 w-full h-full object-cover ${
                      activePhotoIdx === idx ? 'on' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] tracking-[.35em] uppercase text-[#C9A96E] mt-5 text-center transition-opacity duration-500">
              {activeSlide.cap}
            </p>
          </div>
        </aside>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[85] bg-[#0E0E0D]/90 backdrop-blur-md grid place-items-center p-6"
        >
          <img src={lightboxImg} alt="Galeri" className="max-h-[85vh] max-w-full border border-[#C9A96E]/40 shadow-2xl" />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-[#1F1E1C] border border-[#C9A96E]/50 text-[#C9A96E] grid place-items-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Copy Toast Notification */}
      <div
        className={`fixed left-1/2 bottom-24 z-[80] -translate-x-1/2 pointer-events-none transition-all duration-300 bg-[#C9A96E] text-[#0E0E0D] text-sm px-5 py-3 shadow-xl ${
          showCopyToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        Nomor rekening berhasil disalin
      </div>

      {/* Audio Toggle Button */}
      <button
        id="audio-toggle-btn"
        onClick={toggleAudio}
        aria-label="Putar atau jeda musik"
        className={`fixed z-40 bottom-16 lg:bottom-6 right-5 w-12 h-12 rounded-full bg-[#1F1E1C] border border-[#C9A96E]/60 text-[#C9A96E] grid place-items-center shadow-lg transition-opacity duration-500 cursor-pointer ${
          isCoverOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {isPlayingAudio ? <Disc3 className="w-5 h-5 animate-spin" /> : <Disc className="w-5 h-5" />}
      </button>

      {/* Mobile Bottom Dock Navigation */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#171716]/95 backdrop-blur-md border border-[#C9A96E]/35 rounded-full px-4 py-2 flex items-center gap-3.5 text-[11px] tracking-wider text-[#9B968B] shadow-2xl">
        {[
          { id: 'hero', label: 'Sampul' },
          { id: 'couple', label: 'Mempelai' },
          { id: 'event', label: 'Acara' },
          { id: 'gallery', label: 'Galeri' },
          { id: 'rsvp', label: 'RSVP' },
          { id: 'wishes', label: 'Doa' },
        ].map((item) => (
          <a
            key={item.id}
            href={`#lantera-${item.id}`}
            onClick={(e) => scrollToSection(e, item.id)}
            className={activeNav === item.id ? 'text-[#C9A96E] font-medium' : ''}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};
