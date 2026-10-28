import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { ClientInvitationData } from '../types/clientInvitation';
import { collectAdminUploadedPhotos } from '../utils/templateMediaResolver';
import {
  useGuestRecipient,
  useCountdown,
  useAudioController,
  useClipboardCopy,
  useGuestbook,
  useRsvpForm,
} from '../hooks/useInvitationCore';

interface PopKuningTemplateProps {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

const POP_SLIDES = [
  {
    id: 'home',
    num: '01',
    chapTitle: 'Halo',
    chapSub: 'Simpan tanggalnya & rayakan bersama kami',
    label: 'Beranda',
    stamp: 'SAVE THE DATE',
  },
  {
    id: 'couple',
    num: '02',
    chapTitle: 'Kami',
    chapSub: 'Dua mempelai yang siap melangkah bersama',
    label: 'Mempelai',
    stamp: 'THE COUPLE',
  },
  {
    id: 'event',
    num: '03',
    chapTitle: 'Acara',
    chapSub: 'Waktu & tempat berkumpul merayakan cinta',
    label: 'Acara',
    stamp: 'ITINERARY',
  },
  {
    id: 'gift',
    num: '04',
    chapTitle: 'Kado',
    chapSub: 'Doa Anda adalah hadiah terbaik bagi kami',
    label: 'Kado',
    stamp: 'WEDDING GIFT',
  },
  {
    id: 'rsvp',
    num: '05',
    chapTitle: 'Hadir',
    chapSub: 'Konfirmasi kehadiran untuk hari bahagia',
    label: 'RSVP',
    stamp: 'CONFIRMATION',
  },
  {
    id: 'wishes',
    num: '06',
    chapTitle: 'Doa',
    chapSub: 'Kirimkan ucapan hangat untuk mempelai',
    label: 'Ucapan',
    stamp: 'GUESTBOOK',
  },
] as const;

export const PopKuningTemplate: React.FC<PopKuningTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
}) => {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [panelTilt, setPanelTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const rootRef = useRef<HTMLDivElement>(null);

  // Resolve customData with prototype defaults
  const brideName = customData?.brideName || 'Nadia';
  const brideFullName = customData?.brideFullName || 'Nadia Safitri Putri';
  const brideParents = customData?.brideParents || 'Bapak Hendra & Ibu Sari';
  const groomName = customData?.groomName || 'Raka';
  const groomFullName = customData?.groomFullName || 'Raka Mahendra';
  const groomParents = customData?.groomParents || 'Bapak Dimas & Ibu Wulan';

  const eventDateFormatted = customData?.eventDateFormatted || 'Sabtu, 14 November 2026';
  const countdownIsoDate = customData?.countdownIsoDate || '2026-11-14T08:00:00+07:00';

  const akadTime = customData?.akadTime || '08.00 WIB';
  const akadVenue = customData?.akadVenue || 'Masjid Agung Bandung, Jl. Dalem Kaum No. 14';
  const resepsiTime = customData?.resepsiTime || '11.00 – 14.00 WIB';
  const resepsiVenue = customData?.resepsiVenue || 'Gedung Sasana Budaya, Jl. Naripan No. 9';
  const mapsUrl = customData?.mapsUrl || 'https://maps.google.com';

  const quoteText =
    customData?.quoteText ||
    'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan untukmu agar kamu merasa tenteram kepadanya.';
  const quoteSource = customData?.quoteSource || 'QS. Ar-Rum: 21';

  const bankName = customData?.bankName || 'Bank BCA';
  const accountNumber = customData?.accountNumber || '1234 5678 90';
  const accountHolder = customData?.accountHolder || 'Nadia Safitri Putri';

  const songTitle = customData?.songTitle || 'Upbeat Indie Pop Instrumental';
  const audioUrl = customData?.audioUrl || '';

  const { guestName, hideGuestName } = useGuestRecipient('Tamu Undangan');
  const countdown = useCountdown(countdownIsoDate);
  const audio = useAudioController(songTitle, audioUrl);
  const clipboard = useClipboardCopy();
  const guestbook = useGuestbook(
    [
      {
        name: 'Keluarga Besar Hendra',
        message:
          'Barakallahu lakuma wa baraka alaikuma. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
        time: '2 hari lalu',
      },
      {
        name: 'Dina & Fajar',
        message: 'Selamat ya Nad, Raka! Tidak sabar ikut merayakan hari bahagia kalian.',
        time: '1 hari lalu',
      },
      {
        name: 'Pak Imam',
        message: 'Semoga lancar sampai hari H dan langgeng selamanya.',
        time: '5 jam lalu',
      },
    ],
    customData?.id
  );

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const rsvp = useRsvpForm(() => {
    triggerToast('Konfirmasi terkirim');
  }, customData?.id);

  // Media resolution
  const uploadedPhotos = useMemo(() => collectAdminUploadedPhotos(customData), [customData]);

  const heroImage =
    customData?.mediaSlots?.heroImage ||
    uploadedPhotos[0] ||
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75';
  const ambientTexture =
    customData?.mediaSlots?.spotlightImage ||
    uploadedPhotos[3] ||
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=75';
  const bridePortrait =
    customData?.mediaSlots?.bridePortrait ||
    uploadedPhotos[1] ||
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=75';
  const groomPortrait =
    customData?.mediaSlots?.groomPortrait ||
    uploadedPhotos[2] ||
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=75';
  const closingImage =
    customData?.mediaSlots?.closingImage ||
    uploadedPhotos[7] ||
    ambientTexture;

  const galleryImages = useMemo<string[]>(() => {
    const raw = customData?.mediaSlots?.galleryImages;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [
      uploadedPhotos[3] ||
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=500&q=70',
      uploadedPhotos[4] ||
        'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=500&q=70',
      uploadedPhotos[5] ||
        'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=500&q=70',
      uploadedPhotos[6] ||
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=500&q=70',
    ];
  }, [customData?.mediaSlots?.galleryImages, uploadedPhotos]);

  const panelPhotos: Record<string, string> = {
    home: heroImage,
    couple: bridePortrait,
    event: galleryImages[0] || ambientTexture,
    gift: groomPortrait,
    rsvp: galleryImages[1] || heroImage,
    wishes: closingImage,
  };

  // Lock body scroll while gate is closed
  useEffect(() => {
    if (!isGateOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isGateOpen]);

  // IntersectionObserver for .reveal elements
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [isGateOpen]);

  // Accurate viewport scroll-spy & scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const ids = POP_SLIDES.map((s) => s.id);
      const viewportMid = window.innerHeight * 0.45;
      let current: string = ids[0];

      for (const id of ids) {
        const el = document.getElementById(`pop-${id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportMid) {
            current = id;
          }
        }
      }
      setActiveSection(current);

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenGate = () => {
    setIsGateOpen(true);
    audio.startAudio();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`pop-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyAccount = (accNum: string, key: string) => {
    clipboard.copyText(accNum.replace(/\s+/g, ''), key);
    triggerToast('Nomor rekening tersalin');
  };

  const handleWishSubmit = (e: React.FormEvent) => {
    guestbook.submitWish(e);
    triggerToast('Ucapan terkirim');
  };

  const handlePanelMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setPanelTilt({ x: nx, y: ny });
  };

  const handlePanelMouseLeave = () => {
    setPanelTilt({ x: 0, y: 0 });
  };

  const activeIdx = Math.max(0, POP_SLIDES.findIndex((s) => s.id === activeSection));
  const activeSlide = POP_SLIDES[activeIdx] || POP_SLIDES[0];

  const dayNumberMatch = eventDateFormatted.match(/\d+/);
  const dayNumber = dayNumberMatch ? dayNumberMatch[0] : '14';

  const wishBgColors = ['bg-[#ffd23f]', 'bg-[#ffd6cc]', 'bg-[#fffdf5]'];
  const wishTilts = ['-rotate-1', 'rotate-1', 'rotate-0'];

  return (
    <div
      ref={rootRef}
      className={`pop-kuning-root min-h-screen bg-[#ffd23f] text-[#15110c] selection:bg-[#ef4a2d] selection:text-[#fffdf5] relative ${
        isGateOpen ? 'go' : ''
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Hanken+Grotesk:ital,wght@0,400;0,500;0,700;1,400&display=swap');

        .pop-kuning-root {
          font-family: 'Hanken Grotesk', system-ui, sans-serif;
        }
        .font-disp-pop {
          font-family: 'Unbounded', system-ui, sans-serif;
        }
        .hard {
          border: 2px solid #15110c;
          box-shadow: 6px 6px 0 #15110c;
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        button.hard:active, a.hard:active {
          transform: translate(4px, 4px);
          box-shadow: 2px 2px 0 #15110c;
        }
        .hard-sm {
          border: 2px solid #15110c;
          box-shadow: 3px 3px 0 #15110c;
        }
        .photo {
          border: 2px solid #15110c;
          box-shadow: 6px 6px 0 #15110c;
          background: #fff;
          padding: 8px 8px 28px;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
        }
        .photo:hover {
          box-shadow: 9px 9px 0 #15110c;
        }
        .photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .tape::before {
          content: "";
          position: absolute;
          top: -12px;
          left: 50%;
          width: 72px;
          height: 22px;
          transform: translateX(-50%) rotate(-4deg);
          background: rgba(239, 74, 45, 0.82);
          border: 1.5px solid rgba(21, 17, 12, 0.45);
          z-index: 10;
        }
        #pop-gate-cover {
          transition: transform 0.9s cubic-bezier(0.8, 0, 0.2, 1);
        }
        #pop-gate-cover.open {
          transform: translateX(-100%);
          pointer-events: none;
        }
        /* Stacked reactive left panel images & chapters */
        .pop-panel-img {
          opacity: 0;
          transform: scale(1.08) rotate(2deg);
          transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pop-panel-img.on {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
        .pop-chap {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          opacity: 0;
          transform: translateX(-32px) skewX(-4deg);
          transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .pop-chap.on {
          opacity: 1;
          transform: translateX(0) skewX(0deg);
        }
        /* Hero entrance & scroll reveal */
        .rise {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--d, 0ms);
        }
        .go .rise {
          opacity: 1;
          transform: none;
        }
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.in {
          opacity: 1;
          transform: none;
        }
        @keyframes pop-mq {
          to { transform: translateX(-50%); }
        }
        .pop-mq {
          animation: pop-mq 22s linear infinite;
          width: max-content;
        }
        @keyframes pop-spin-slow {
          to { transform: rotate(360deg); }
        }
        .pop-spin {
          animation: pop-spin-slow 18s linear infinite;
        }
        @keyframes pop-tick {
          from { transform: translateY(-5px); opacity: 0.45; }
          to { transform: none; opacity: 1; }
        }
        .pop-tick {
          animation: pop-tick 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pop-dots-bg {
          background-image: radial-gradient(#15110c 1.25px, transparent 1.25px);
          background-size: 22px 22px;
        }
      `}</style>

      {/* Demo Back & Order Toolbar */}
      {onBackToLanding && (
        <div className="fixed top-14 left-4 z-[60]">
          <button
            type="button"
            onClick={onBackToLanding}
            className="hard-sm flex items-center gap-2 px-3.5 py-2 bg-[#fffdf5] hover:bg-[#ffd6cc] text-[#15110c] text-xs font-disp-pop font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#ef4a2d]" />
            <span>Kembali</span>
          </button>
        </div>
      )}

      {onOrderViaWhatsApp && (
        <div className="fixed top-14 right-4 z-[60]">
          <button
            type="button"
            onClick={onOrderViaWhatsApp}
            className="hard-sm flex items-center gap-2 px-3.5 py-2 bg-[#ef4a2d] hover:bg-[#15110c] text-[#fffdf5] text-xs font-disp-pop font-bold transition cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan Tema Ini</span>
          </button>
        </div>
      )}

      {/* GATE COVER */}
      <div
        id="pop-gate-cover"
        className={`fixed inset-0 z-[100] bg-[#ffd23f] flex flex-col justify-between p-6 sm:p-10 overflow-hidden ${
          isGateOpen ? 'open' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="font-disp-pop font-bold text-xs uppercase tracking-wider bg-[#fffdf5] hard-sm px-3 py-1.5">
            Undangan Pernikahan
          </p>
          <span className="font-disp-pop font-bold text-xs">{eventDateFormatted}</span>
        </div>

        <div className="relative my-auto py-6">
          <h1 className="font-disp-pop font-black text-[19vw] sm:text-[7.5rem] leading-[0.85] uppercase break-words relative z-10">
            <span>{brideName}</span>
            <br />
            <span className="text-[#ef4a2d]">+</span> <span>{groomName}</span>
          </h1>
          <div className="hidden sm:block absolute right-4 lg:right-16 top-1/2 -translate-y-1/2 w-48 lg:w-56 photo rotate-6 bg-[#fffdf5] tape z-20">
            <div className="aspect-square">
              <img alt={`${brideName} & ${groomName}`} src={ambientTexture} />
            </div>
          </div>
        </div>

        <div className="relative z-10">
          {!hideGuestName && (
            <p className="text-sm">
              Kepada: <b className="font-bold underline decoration-2">{guestName}</b>
            </p>
          )}
          <button
            id="btn-open-invitation"
            type="button"
            onClick={handleOpenGate}
            className="hard mt-4 bg-[#15110c] text-[#ffd23f] font-disp-pop font-bold text-sm px-8 py-4 hover:bg-[#ef4a2d] hover:text-[#15110c] transition cursor-pointer"
          >
            Buka Undangan ✦
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT CONTAINER (No overflow-x-hidden on ancestor so sticky works!) */}
      <div className="lg:flex">
        {/* LEFT REACTIVE PANEL (Sticky Desktop) */}
        <aside
          onMouseMove={handlePanelMouseMove}
          onMouseLeave={handlePanelMouseLeave}
          className="hidden lg:block w-1/2 h-screen sticky top-0 bg-[#ffd23f] overflow-hidden border-r-2 border-[#15110c] select-none"
          aria-hidden="true"
        >
          {/* Subtle dot grid texture */}
          <div className="absolute inset-0 pop-dots-bg opacity-[0.14] pointer-events-none" />

          {/* Top Bar */}
          <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <span
                id="panel-count"
                className="hard-sm bg-[#fffdf5] px-3 py-1 font-disp-pop font-bold text-xs"
              >
                {activeSlide.num} / 06
              </span>
              <span className="hard-sm bg-[#ef4a2d] text-[#fffdf5] px-2.5 py-1 font-disp-pop font-bold text-[10px] tracking-wider uppercase">
                {activeSlide.stamp}
              </span>
            </div>
            <p className="font-disp-pop font-bold text-sm bg-[#ffd23f] px-2">
              <span>{brideName}</span> <span className="text-[#ef4a2d]">+</span>{' '}
              <span>{groomName}</span>
            </p>
          </div>

          {/* Stacked Reactive Chapter Typography */}
          <div className="absolute left-8 right-8 top-[13%] xl:top-[14%] h-36 z-20 pointer-events-none">
            {POP_SLIDES.map((s) => {
              const isOn = s.id === activeSection;
              return (
                <div key={s.id} className={`pop-chap ${isOn ? 'on' : ''}`} data-chap={s.id}>
                  <span
                    className="font-disp-pop font-black text-[4.8rem] xl:text-[5.8rem] leading-none uppercase tracking-tight text-[#15110c]"
                    style={{ textShadow: '4px 4px 0 #fffdf5' }}
                  >
                    {s.chapTitle}
                  </span>
                  <span className="mt-3 inline-block w-fit hard-sm bg-[#ffd6cc] px-3 py-1 text-xs font-bold text-[#15110c]">
                    {s.chapSub}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Central Polaroid Showcase Zone (Comfortably spaced, no edge cropping, no text overlap) */}
          <div className="absolute inset-x-8 top-[33%] bottom-28 flex items-center justify-center z-20 pointer-events-none">
            <div
              className="relative w-[65%] max-w-[275px] xl:max-w-[305px] photo bg-[#fffdf5] tape pointer-events-auto"
              style={{
                transform: `translate3d(${panelTilt.x * 14}px, ${panelTilt.y * 14}px, 0) rotate(${
                  -2 + panelTilt.x * 4
                }deg)`,
                transition: 'transform 0.25s ease-out',
              }}
            >
              {/* Rotating Neo-Brutalist Starburst Sticker attached directly to top-left of polaroid */}
              <div className="absolute -left-7 -top-7 z-30 w-20 h-20 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full pop-spin drop-shadow-[2px_2px_0_#15110c]">
                  <polygon
                    points="50,2 61,18 79,11 81,30 98,38 88,54 96,71 78,77 73,95 56,88 41,98 33,81 14,82 18,63 3,51 17,37 11,19 30,20 39,4 50,16"
                    fill="#ef4a2d"
                    stroke="#15110c"
                    strokeWidth="3"
                  />
                </svg>
                <span className="absolute font-disp-pop font-black text-[9px] text-[#fffdf5] text-center leading-tight uppercase rotate-[-8deg]">
                  {dayNumber}
                  <br />
                  PARTY!
                </span>
              </div>

              <div className="relative aspect-[4/5] overflow-hidden bg-[#15110c]">
                {POP_SLIDES.map((s) => {
                  const isOn = s.id === activeSection;
                  return (
                    <img
                      key={s.id}
                      className={`pop-panel-img absolute inset-0 w-full h-full object-cover ${
                        isOn ? 'on' : ''
                      }`}
                      data-panel={s.id}
                      alt={s.chapTitle}
                      src={panelPhotos[s.id]}
                    />
                  );
                })}
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] font-disp-pop font-bold">
                <span>#{activeSlide.chapTitle.toUpperCase()}</span>
                <span className="text-[#ef4a2d]">✦ {activeSlide.num}</span>
              </div>
            </div>
          </div>

          {/* Bottom Card: Info & Interactive Section Jumper Pills (Separated and never blocked) */}
          <div className="absolute left-8 right-8 bottom-6 z-20">
            <div className="hard-sm bg-[#fffdf5] p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <p className="text-xs font-bold leading-snug text-[#15110c]">
                {eventDateFormatted} · Datang, makan enak, dan rayakan bersama kami.
              </p>
              <div className="flex items-center gap-1 shrink-0">
                {POP_SLIDES.map((s) => {
                  const isOn = s.id === activeSection;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollToSection(s.id)}
                      className={`hard-sm px-2 py-1 text-[10px] font-disp-pop font-bold transition cursor-pointer ${
                        isOn
                          ? 'bg-[#15110c] text-[#ffd23f] -translate-y-0.5'
                          : 'bg-[#ffd23f] text-[#15110c] hover:bg-[#ffd6cc]'
                      }`}
                      title={s.label}
                    >
                      {s.num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#fffdf5] border-t-2 border-[#15110c] z-30">
            <div
              className="h-full bg-[#ef4a2d] transition-all duration-150"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        </aside>

        {/* RIGHT SCROLLABLE CONTENT */}
        <main className="w-full lg:w-1/2 bg-[#fffdf5] overflow-x-hidden">
          {/* STICKY TOP NAV */}
          <nav
            className="sticky top-0 z-40 bg-[#15110c] text-[#fffdf5] text-[11px] font-bold flex justify-center overflow-x-auto border-b-2 border-[#15110c]"
            aria-label="Navigasi"
          >
            {POP_SLIDES.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-3 whitespace-nowrap border-b-[3px] transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#ffd23f] text-[#ffd23f]'
                      : 'border-transparent text-[#fffdf5] hover:text-[#ffd23f]/80'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="max-w-[480px] mx-auto">
            {/* HERO */}
            <section id="pop-home" data-panel-section="home" className="px-6 pt-14 pb-20">
              <p
                className="rise font-disp-pop font-bold text-xs uppercase tracking-wider inline-block bg-[#ffd6cc] hard-sm px-3 py-1"
                style={{ '--d': '80ms' } as React.CSSProperties}
              >
                Kami akan menikah
              </p>
              <h2
                className="rise font-disp-pop font-black uppercase text-[3.8rem] sm:text-[4.2rem] leading-[0.88] mt-5 break-words"
                style={{ '--d': '180ms' } as React.CSSProperties}
              >
                <span>{brideName}</span>
                <br />
                <span className="text-[#ef4a2d]">+</span> <span>{groomName}</span>
              </h2>
              <div
                className="rise photo relative tape rotate-2 mt-12 bg-white cursor-pointer"
                style={{ '--d': '300ms' } as React.CSSProperties}
                onClick={() => setLightboxImg(heroImage)}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    alt="Foto mempelai"
                    src={heroImage}
                    className="hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div
                className="rise hard bg-[#ffd23f] mt-12 p-5 flex items-end justify-between"
                style={{ '--d': '420ms' } as React.CSSProperties}
              >
                <p className="font-disp-pop font-black text-6xl leading-none">{dayNumber}</p>
                <p className="text-right font-bold leading-snug">{eventDateFormatted}</p>
              </div>
              {!hideGuestName && (
                <p
                  id="guest-badge"
                  className="rise mt-4 text-sm"
                  style={{ '--d': '500ms' } as React.CSSProperties}
                >
                  Untuk: <b className="font-bold">{guestName}</b>
                </p>
              )}
            </section>

            {/* MARQUEE */}
            <div
              className="bg-[#15110c] text-[#ffd23f] py-3 overflow-hidden border-y-2 border-[#15110c]"
              aria-hidden="true"
            >
              <div className="pop-mq flex font-disp-pop font-bold text-sm whitespace-nowrap">
                <span className="pr-8">
                  Simpan tanggalnya ✦ {eventDateFormatted} ✦ Simpan tanggalnya ✦{' '}
                  {eventDateFormatted} ✦ Simpan tanggalnya ✦ {eventDateFormatted} ✦{' '}
                </span>
                <span className="pr-8">
                  Simpan tanggalnya ✦ {eventDateFormatted} ✦ Simpan tanggalnya ✦{' '}
                  {eventDateFormatted} ✦ Simpan tanggalnya ✦ {eventDateFormatted} ✦{' '}
                </span>
              </div>
            </div>

            {/* QUOTE */}
            <section className="reveal px-7 py-16 bg-[#ffd6cc] border-b-2 border-[#15110c]">
              <p className="font-disp-pop font-bold text-xl sm:text-2xl leading-snug">
                {quoteText}
              </p>
              <p className="text-sm font-bold mt-5">{quoteSource}</p>
            </section>

            {/* COUPLE */}
            <section id="pop-couple" data-panel-section="couple" className="px-6 py-20 space-y-16">
              <div className="reveal">
                <div
                  className="photo relative tape -rotate-3 w-[68%] cursor-pointer"
                  onClick={() => setLightboxImg(bridePortrait)}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      alt="Mempelai wanita"
                      src={bridePortrait}
                      className="hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="hard bg-[#ffd23f] p-5 -mt-10 ml-[24%] sm:ml-[28%] relative z-10">
                  <p className="text-xs font-bold uppercase tracking-wider">Mempelai wanita</p>
                  <h3 className="font-disp-pop font-black text-xl sm:text-2xl uppercase leading-tight mt-1">
                    {brideFullName}
                  </h3>
                  <p className="text-sm mt-2">
                    Putri dari <span>{brideParents}</span>
                  </p>
                </div>
              </div>

              <div className="reveal">
                <div
                  className="photo relative tape rotate-3 w-[68%] ml-auto cursor-pointer"
                  onClick={() => setLightboxImg(groomPortrait)}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      alt="Mempelai pria"
                      src={groomPortrait}
                      className="hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="hard bg-[#ffd6cc] p-5 -mt-10 mr-[24%] sm:mr-[28%] relative z-10">
                  <p className="text-xs font-bold uppercase tracking-wider">Mempelai pria</p>
                  <h3 className="font-disp-pop font-black text-xl sm:text-2xl uppercase leading-tight mt-1">
                    {groomFullName}
                  </h3>
                  <p className="text-sm mt-2">
                    Putra dari <span>{groomParents}</span>
                  </p>
                </div>
              </div>
            </section>

            {/* EVENT */}
            <section
              id="pop-event"
              data-panel-section="event"
              className="px-6 py-20 bg-[#ffd23f] border-y-2 border-[#15110c]"
            >
              <h2 className="reveal font-disp-pop font-black uppercase text-4xl leading-none">
                Hari
                <br />
                Bahagia
              </h2>
              <div className="reveal grid grid-cols-4 gap-2 mt-8 text-center">
                <div className="hard-sm bg-[#fffdf5] py-3">
                  <p key={countdown.days} className="font-disp-pop font-black text-2xl pop-tick">
                    {String(countdown.days).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] font-bold">HARI</p>
                </div>
                <div className="hard-sm bg-[#fffdf5] py-3">
                  <p key={countdown.hours} className="font-disp-pop font-black text-2xl pop-tick">
                    {String(countdown.hours).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] font-bold">JAM</p>
                </div>
                <div className="hard-sm bg-[#fffdf5] py-3">
                  <p key={countdown.mins} className="font-disp-pop font-black text-2xl pop-tick">
                    {String(countdown.mins).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] font-bold">MENIT</p>
                </div>
                <div className="hard-sm bg-[#fffdf5] py-3">
                  <p key={countdown.secs} className="font-disp-pop font-black text-2xl pop-tick">
                    {String(countdown.secs).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] font-bold">DETIK</p>
                </div>
              </div>

              <div className="mt-10 space-y-5">
                <article className="reveal hard bg-[#fffdf5] p-6">
                  <p className="inline-block bg-[#15110c] text-[#ffd23f] text-xs font-bold px-2 py-1">
                    AKAD NIKAH
                  </p>
                  <p className="font-disp-pop font-black text-3xl sm:text-4xl mt-3">{akadTime}</p>
                  <p className="text-sm mt-2 leading-relaxed">{akadVenue}</p>
                </article>

                <article className="reveal hard bg-[#fffdf5] p-6">
                  <p className="inline-block bg-[#ef4a2d] text-[#15110c] text-xs font-bold px-2 py-1">
                    RESEPSI
                  </p>
                  <p className="font-disp-pop font-black text-3xl sm:text-4xl mt-3">
                    {resepsiTime}
                  </p>
                  <p className="text-sm mt-2 leading-relaxed">{resepsiVenue}</p>
                </article>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reveal hard block text-center bg-[#15110c] text-[#ffd23f] font-disp-pop font-bold text-sm py-4 hover:bg-[#ef4a2d] hover:text-[#15110c] transition"
                >
                  Buka Google Maps ✦
                </a>
              </div>
            </section>

            {/* GALLERY */}
            <section className="px-5 py-20 overflow-hidden">
              <h2 className="reveal font-disp-pop font-black uppercase text-4xl leading-none mb-10">
                Album
                <br />
                Kami
              </h2>
              <div className="grid grid-cols-2 gap-x-5 gap-y-8">
                {galleryImages.slice(0, 4).map((imgUrl: string, idx: number) => {
                  const tilts = ['-rotate-2', 'rotate-3 mt-8', 'rotate-2', '-rotate-3 mt-8'];
                  const aspects = ['aspect-square', 'aspect-[3/4]', 'aspect-[3/4]', 'aspect-square'];
                  return (
                    <div
                      key={idx}
                      onClick={() => setLightboxImg(imgUrl)}
                      className={`reveal photo cursor-pointer ${tilts[idx % 4]}`}
                    >
                      <div className={`${aspects[idx % 4]} overflow-hidden`}>
                        <img
                          alt={`Galeri ${idx + 1}`}
                          src={imgUrl}
                          className="hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* GIFT */}
            <section id="pop-gift" data-panel-section="gift" className="px-6 pb-20">
              <h2 className="reveal font-disp-pop font-black uppercase text-4xl leading-none">
                Kado
                <br />
                Digital
              </h2>
              <p className="reveal text-sm mt-4 leading-relaxed">
                Doa Anda sudah jadi hadiah terbaik. Kalau ingin berbagi lebih, kami terima dengan
                senang hati.
              </p>

              <div className="reveal hard bg-[#15110c] text-[#fffdf5] p-6 mt-8">
                <p className="text-[#ffd23f] font-bold">{bankName}</p>
                <p className="font-disp-pop font-bold text-2xl sm:text-3xl mt-5 tracking-wide">
                  {accountNumber}
                </p>
                <p className="text-sm mt-2 text-[#fffdf5]/70">
                  a.n. <span>{accountHolder}</span>
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(accountNumber, 'pop-acc-0')}
                  className="mt-6 bg-[#ffd23f] text-[#15110c] font-disp-pop font-bold text-xs px-5 py-3 border-2 border-[#ffd23f] hover:bg-[#ef4a2d] hover:border-[#ef4a2d] transition cursor-pointer"
                >
                  {clipboard.isCopied('pop-acc-0') ? 'Tersalin!' : 'Salin nomor'}
                </button>
              </div>
            </section>

            {/* RSVP */}
            <section
              id="pop-rsvp"
              data-panel-section="rsvp"
              className="px-6 py-20 bg-[#ffd6cc] border-y-2 border-[#15110c]"
            >
              <h2 className="reveal font-disp-pop font-black uppercase text-4xl leading-none">
                Bisa
                <br />
                Hadir?
              </h2>
              <form onSubmit={rsvp.submitRsvp} className="reveal mt-8 space-y-3">
                <input
                  required
                  value={rsvp.rsvpName}
                  onChange={(e) => rsvp.setRsvpName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="hard-sm w-full bg-[#fffdf5] px-4 py-3 text-sm focus:outline-none"
                />
                <select
                  value={rsvp.attendance}
                  onChange={(e) =>
                    rsvp.setAttendance(e.target.value as 'hadir' | 'ragu' | 'tidak_hadir')
                  }
                  className="hard-sm w-full bg-[#fffdf5] px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Tidak bisa hadir</option>
                  <option value="ragu">Masih ragu</option>
                </select>
                <select
                  value={rsvp.guestCount}
                  onChange={(e) => rsvp.setGuestCount(e.target.value)}
                  className="hard-sm w-full bg-[#fffdf5] px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="1">1 orang</option>
                  <option value="2">2 orang</option>
                  <option value="3">3 orang</option>
                  <option value="4">4 orang</option>
                </select>
                <button
                  type="submit"
                  className="hard w-full bg-[#15110c] text-[#ffd23f] font-disp-pop font-bold text-sm py-4 hover:bg-[#ef4a2d] hover:text-[#15110c] transition cursor-pointer"
                >
                  Kirim konfirmasi
                </button>
              </form>
            </section>

            {/* UCAPAN / KOMENTAR */}
            <section id="pop-wishes" data-panel-section="wishes" className="px-6 py-20">
              <h2 className="reveal font-disp-pop font-black uppercase text-4xl leading-none">
                Ucapan
                <br />
                &amp; Doa
              </h2>
              <p className="reveal text-sm mt-3">
                <b>{guestbook.wishes.length}</b> ucapan sudah masuk
              </p>

              <form
                onSubmit={handleWishSubmit}
                className="reveal hard bg-[#ffd23f] p-5 mt-6 space-y-3"
              >
                <input
                  required
                  maxLength={40}
                  value={guestbook.nameInput}
                  onChange={(e) => guestbook.setNameInput(e.target.value)}
                  placeholder="Nama Anda"
                  className="hard-sm w-full bg-[#fffdf5] px-3 py-2.5 text-sm focus:outline-none"
                />
                <textarea
                  required
                  maxLength={300}
                  rows={3}
                  value={guestbook.messageInput}
                  onChange={(e) => guestbook.setMessageInput(e.target.value)}
                  placeholder="Tulis ucapan untuk mempelai"
                  className="hard-sm w-full bg-[#fffdf5] px-3 py-2.5 text-sm resize-none focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-[#15110c] text-[#ffd23f] font-disp-pop font-bold text-xs py-3 hover:bg-[#ef4a2d] hover:text-[#15110c] transition cursor-pointer"
                >
                  Kirim ucapan
                </button>
              </form>

              <ul className="mt-8 space-y-5 max-h-[460px] overflow-y-auto pr-2 pb-2">
                {guestbook.wishes.map((w, i) => (
                  <li
                    key={i}
                    className={`hard-sm ${wishBgColors[i % 3]} ${wishTilts[i % 3]} p-4`}
                  >
                    <p className="text-sm leading-relaxed break-words">{w.message}</p>
                    <p className="mt-3 text-xs">
                      <b className="font-disp-pop">{w.name}</b>{' '}
                      <span className="text-[#15110c]/60">· {w.time || 'Baru saja'}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* CLOSING */}
            <section className="bg-[#15110c] text-[#fffdf5] px-6 py-20">
              <div
                className="reveal photo relative tape rotate-2 w-[75%] mx-auto cursor-pointer"
                onClick={() => setLightboxImg(closingImage)}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img alt="Penutup" src={closingImage} />
                </div>
              </div>
              <p className="reveal font-disp-pop font-black uppercase text-4xl leading-[0.95] mt-14 text-[#ffd23f]">
                Terima
                <br />
                kasih!
              </p>
              <p className="reveal mt-4 text-sm text-[#fffdf5]/80">
                Sampai jumpa di hari bahagia kami,
                <br />
                <b>{brideName}</b> + <b>{groomName}</b>
              </p>
            </section>
          </div>
        </main>
      </div>

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[200] bg-[#15110c]/90 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
        >
          <div className="photo bg-[#fffdf5] max-w-lg w-full rotate-1">
            <img src={lightboxImg} alt="Pratinjau" className="w-full max-h-[78vh] object-contain" />
          </div>
        </div>
      )}

      {/* AUDIO BUTTON */}
      {audio.hasAudio && (
        <button
          id="audio-toggle-btn"
          type="button"
          onClick={audio.toggleAudio}
          className="hard-sm fixed bottom-5 right-5 z-50 w-11 h-11 bg-[#ffd23f] flex items-center justify-center hover:bg-[#ef4a2d] transition cursor-pointer"
          aria-label="Putar musik"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#15110c"
            strokeWidth="2.2"
            className={audio.isPlayingAudio ? 'animate-spin' : ''}
            style={{ animationDuration: '6s' }}
          >
            <path d="M9 18V6l10-2v12" />
            <rect x="3.5" y="15.5" width="5" height="5" />
            <rect x="14" y="13.5" width="5" height="5" />
          </svg>
        </button>
      )}

      {/* TOAST NOTIFICATION */}
      <div
        id="toast-notification"
        className={`hard-sm fixed top-16 left-1/2 z-[120] bg-[#ffd23f] text-[#15110c] font-bold text-sm px-5 py-2.5 pointer-events-none transition-all duration-300 ${
          toastMsg
            ? 'opacity-100 -translate-x-1/2 translate-y-0'
            : 'opacity-0 -translate-x-1/2 -translate-y-4'
        }`}
      >
        {toastMsg}
      </div>
    </div>
  );
};
export default PopKuningTemplate;
