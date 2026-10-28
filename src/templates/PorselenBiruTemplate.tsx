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

interface PorselenBiruTemplateProps {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

const PORSELEN_SLIDES = [
  {
    id: 'home',
    title: 'Selamat Datang',
    subtitle: 'Dua keluarga, satu hari',
    label: 'Beranda',
  },
  {
    id: 'couple',
    title: 'Mempelai',
    subtitle: 'Dua cerita bertemu',
    label: 'Mempelai',
  },
  {
    id: 'event',
    title: 'Acara',
    subtitle: 'Waktu dan tempat',
    label: 'Acara',
  },
  {
    id: 'gift',
    title: 'Tanda Kasih',
    subtitle: 'Doa Anda sudah cukup',
    label: 'Hadiah',
  },
  {
    id: 'rsvp',
    title: 'Kehadiran',
    subtitle: 'Mohon konfirmasi',
    label: 'RSVP',
  },
  {
    id: 'wishes',
    title: 'Ucapan',
    subtitle: 'Tulis doa untuk kami',
    label: 'Ucapan',
  },
] as const;

export const PorselenBiruTemplate: React.FC<PorselenBiruTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
}) => {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [panelParallax, setPanelParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  const songTitle = customData?.songTitle || 'Classical Strings & Piano';
  const audioUrl = customData?.audioUrl || '';

  const initials = `${brideName.trim().charAt(0).toUpperCase() || 'N'} & ${groomName.trim().charAt(0).toUpperCase() || 'R'}`;

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
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=75';
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
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=70',
      uploadedPhotos[4] ||
        'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=500&q=70',
      uploadedPhotos[5] ||
        'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=500&q=70',
      uploadedPhotos[6] ||
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=70',
      uploadedPhotos[0] ||
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=70',
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
      { threshold: 0.18 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [isGateOpen]);

  // Accurate viewport scroll-spy
  useEffect(() => {
    const handleScroll = () => {
      const ids = PORSELEN_SLIDES.map((s) => s.id);
      const viewportMid = window.innerHeight * 0.45;
      let current: string = ids[0];

      for (const id of ids) {
        const el = document.getElementById(`porselen-${id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportMid) {
            current = id;
          }
        }
      }
      setActiveSection(current);
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
    const el = document.getElementById(`porselen-${id}`);
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
    setPanelParallax({ x: nx, y: ny });
  };

  const handlePanelMouseLeave = () => {
    setPanelParallax({ x: 0, y: 0 });
  };

  const activeIdx = Math.max(0, PORSELEN_SLIDES.findIndex((s) => s.id === activeSection));

  return (
    <div
      ref={rootRef}
      className={`porselen-biru-root min-h-screen bg-[#f6f7fa] text-[#0e1730] selection:bg-[#1d3b8f] selection:text-white relative ${
        isGateOpen ? 'go' : ''
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;400;500;600&display=swap');

        .porselen-biru-root {
          font-family: 'Figtree', system-ui, sans-serif;
        }
        .font-disp-porc {
          font-family: 'Instrument Serif', Georgia, serif;
        }
        .porc-tile {
          background-color: #1d3b8f;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cg fill='none' stroke='%23fff' stroke-opacity='.16' stroke-width='1.2'%3E%3Ccircle cx='28' cy='0' r='28'/%3E%3Ccircle cx='28' cy='56' r='28'/%3E%3Ccircle cx='0' cy='28' r='28'/%3E%3Ccircle cx='56' cy='28' r='28'/%3E%3Ccircle cx='28' cy='28' r='5'/%3E%3C/g%3E%3C/svg%3E");
        }
        .porc-tile-light {
          background-color: #f6f7fa;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cg fill='none' stroke='%231d3b8f' stroke-opacity='.09' stroke-width='1.2'%3E%3Ccircle cx='28' cy='0' r='28'/%3E%3Ccircle cx='28' cy='56' r='28'/%3E%3Ccircle cx='0' cy='28' r='28'/%3E%3Ccircle cx='56' cy='28' r='28'/%3E%3Ccircle cx='28' cy='28' r='5'/%3E%3C/g%3E%3C/svg%3E");
        }
        .porc-frame {
          outline: 1px solid #1d3b8f;
          outline-offset: 6px;
        }
        #porc-gate-cover {
          transition: transform 1s cubic-bezier(0.7, 0, 0.2, 1);
        }
        #porc-gate-cover.open {
          transform: translateY(-100%);
          pointer-events: none;
        }
        /* Stacked reactive left panel images & chapters */
        .porc-panel-img {
          opacity: 0;
          transform: scale(1.08);
          transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 5.5s ease-out;
        }
        .porc-panel-img.on {
          opacity: 1;
          transform: scale(1);
        }
        .porc-chap {
          position: absolute;
          left: 0;
          right: 0;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .porc-chap.on {
          opacity: 1;
          transform: translateY(0);
        }
        /* Hero entrance & scroll reveal */
        .rise {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--d, 0ms);
        }
        .go .rise {
          opacity: 1;
          transform: none;
        }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.in {
          opacity: 1;
          transform: none;
        }
        .porc-ticket {
          mask: radial-gradient(circle 12px at 0 62%, #0000 98%, #000) left/51% 100% no-repeat,
                radial-gradient(circle 12px at 100% 62%, #0000 98%, #000) right/51% 100% no-repeat;
          -webkit-mask: radial-gradient(circle 12px at 0 62%, #0000 98%, #000) left/51% 100% no-repeat,
                        radial-gradient(circle 12px at 100% 62%, #0000 98%, #000) right/51% 100% no-repeat;
        }
        @keyframes porc-rosette-spin {
          to { transform: rotate(360deg); }
        }
        .porc-rosette {
          animation: porc-rosette-spin 55s linear infinite;
        }
        @keyframes porc-tick {
          from { transform: translateY(-5px); opacity: 0.4; }
          to { transform: none; opacity: 1; }
        }
        .porc-tick {
          animation: porc-tick 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>

      {/* Demo Back & Order Toolbar */}
      {onBackToLanding && (
        <div className="fixed top-4 left-4 z-[60]">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-[#dfe7f8] text-[#0e2260] border border-[#c9d3ea] text-xs font-medium shadow-md transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1d3b8f]" />
            <span>Kembali</span>
          </button>
        </div>
      )}

      {onOrderViaWhatsApp && (
        <div className="fixed top-4 right-16 z-[60]">
          <button
            type="button"
            onClick={onOrderViaWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d3b8f] hover:bg-[#0e2260] text-white text-xs font-medium shadow-md transition cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan Tema Ini</span>
          </button>
        </div>
      )}

      {/* GATE COVER */}
      <div
        id="porc-gate-cover"
        className={`fixed inset-0 z-[100] porc-tile flex items-center justify-center text-center px-8 text-white ${
          isGateOpen ? 'open' : ''
        }`}
      >
        <div className="max-w-sm">
          <p className="text-xs tracking-[0.25em] text-[#dfe7f8] uppercase">Undangan Pernikahan</p>
          <div className="relative mx-auto mt-8 w-52">
            <img
              alt={`${brideName} & ${groomName}`}
              src={ambientTexture}
              className="w-full aspect-[3/4] object-cover rounded-t-full"
            />
            <div className="absolute -inset-2 rounded-t-full border border-white/60 pointer-events-none" />
          </div>
          <h1 className="font-disp-porc text-6xl mt-9 leading-[0.95]">
            <span>{brideName}</span>
            <br />
            <span className="italic text-[#dfe7f8] text-4xl">dan</span>
            <br />
            <span>{groomName}</span>
          </h1>
          {!hideGuestName && (
            <p className="mt-7 text-sm text-[#dfe7f8]">
              Kepada <b className="text-white font-medium">{guestName}</b>
            </p>
          )}
          <button
            id="btn-open-invitation"
            type="button"
            onClick={handleOpenGate}
            className="mt-6 bg-white text-[#0e2260] font-medium text-sm px-9 py-3 rounded-full hover:bg-[#dfe7f8] transition cursor-pointer shadow-lg"
          >
            Buka Undangan
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT CONTAINER (No overflow-x-hidden on root so sticky works!) */}
      <div className="lg:flex">
        {/* LEFT REACTIVE PANEL (Sticky Desktop) */}
        <aside
          onMouseMove={handlePanelMouseMove}
          onMouseLeave={handlePanelMouseLeave}
          className="hidden lg:flex w-1/2 h-screen sticky top-0 porc-tile text-white flex-col items-center justify-center overflow-hidden select-none"
          aria-hidden="true"
        >
          {/* Rotating Porcelain Mandala Halo Behind Arch */}
          <svg
            viewBox="0 0 200 200"
            className="porc-rosette absolute w-[68%] max-w-[420px] opacity-20 pointer-events-none"
          >
            <circle cx="100" cy="100" r="94" fill="none" stroke="#dfe7f8" strokeWidth="0.6" strokeDasharray="3 4" />
            <circle cx="100" cy="100" r="82" fill="none" stroke="#ffffff" strokeWidth="0.5" />
            {Array.from({ length: 12 }).map((_, idx) => (
              <ellipse
                key={idx}
                cx="100"
                cy="100"
                rx="32"
                ry="88"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.45"
                transform={`rotate(${idx * 15} 100 100)`}
              />
            ))}
          </svg>

          {/* Arched Multi-Layer Photo Frame with 3D Mouse Parallax */}
          <div
            className="relative w-[46%] max-w-[290px] z-10"
            style={{
              transform: `translate3d(${panelParallax.x * 16}px, ${panelParallax.y * 16}px, 0)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <div className="relative aspect-[3/4] rounded-t-full overflow-hidden bg-[#0e2260] shadow-2xl">
              {PORSELEN_SLIDES.map((s) => {
                const isOn = s.id === activeSection;
                return (
                  <img
                    key={s.id}
                    className={`porc-panel-img absolute inset-0 w-full h-full object-cover ${
                      isOn ? 'on' : ''
                    }`}
                    data-panel={s.id}
                    alt={s.title}
                    src={panelPhotos[s.id]}
                  />
                );
              })}
            </div>
            <div className="absolute -inset-3 rounded-t-full border border-white/60 pointer-events-none" />
            <div className="absolute -inset-5 rounded-t-full border border-white/20 pointer-events-none" />
          </div>

          {/* Stacked Chapter Titles (Smooth Cross-Fade & Slide) */}
          <div className="relative w-[68%] h-28 mt-12 text-center z-10">
            {PORSELEN_SLIDES.map((s) => {
              const isOn = s.id === activeSection;
              return (
                <div key={s.id} className={`porc-chap ${isOn ? 'on' : ''}`} data-chap={s.id}>
                  <p className="font-disp-porc text-5xl">{s.title}</p>
                  <p className="text-sm text-[#dfe7f8] mt-2">{s.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Interactive Porcelain Section Dots */}
          <div className="mt-4 flex items-center gap-2.5 z-10">
            {PORSELEN_SLIDES.map((s) => {
              const isOn = s.id === activeSection;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToSection(s.id)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isOn ? 'w-7 bg-white' : 'w-2 bg-white/35 hover:bg-white/60'
                  }`}
                  title={s.label}
                />
              );
            })}
          </div>

          {/* Corner Monogram & Slide Counter */}
          <p className="absolute top-8 left-10 font-disp-porc text-2xl">{initials}</p>
          <p id="panel-count" className="absolute top-9 right-10 text-xs text-[#dfe7f8] tracking-widest">
            {activeIdx + 1} / {PORSELEN_SLIDES.length}
          </p>
        </aside>

        {/* RIGHT SCROLLABLE CONTENT */}
        <main className="w-full lg:w-1/2 porc-tile-light overflow-x-hidden">
          <div className="max-w-[480px] mx-auto bg-[#f6f7fa]/92 shadow-[0_0_0_1px_#c9d3ea]">
            {/* HERO */}
            <section id="porselen-home" data-panel-section="home" className="px-7 pt-16 pb-28 text-center">
              <p
                className="rise text-xs tracking-[0.25em] text-[#1d3b8f] uppercase"
                style={{ '--d': '80ms' } as React.CSSProperties}
              >
                Kami menikah
              </p>
              <h2
                className="rise font-disp-porc text-[4.8rem] sm:text-[5.5rem] leading-[0.88] mt-6 text-[#0e2260]"
                style={{ '--d': '180ms' } as React.CSSProperties}
              >
                <span>{brideName}</span>
                <span className="block italic text-[#1d3b8f] text-5xl my-1">&amp;</span>
                <span>{groomName}</span>
              </h2>
              <div
                className="rise relative mx-auto mt-10 w-[80%] cursor-pointer"
                style={{ '--d': '300ms' } as React.CSSProperties}
                onClick={() => setLightboxImg(heroImage)}
              >
                <img
                  alt="Foto mempelai"
                  src={heroImage}
                  className="w-full aspect-[3/4] object-cover rounded-t-full porc-frame hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <p
                className="rise font-disp-porc italic text-3xl mt-12 text-[#0e2260]"
                style={{ '--d': '420ms' } as React.CSSProperties}
              >
                {eventDateFormatted}
              </p>
              {!hideGuestName && (
                <p
                  id="guest-badge"
                  className="rise mt-3 text-sm text-[#0e1730]/60"
                  style={{ '--d': '500ms' } as React.CSSProperties}
                >
                  Untuk <span className="font-medium text-[#0e2260]">{guestName}</span>
                </p>
              )}
            </section>

            {/* QUOTE */}
            <section className="reveal porc-tile text-white px-10 py-20 text-center">
              <p className="font-disp-porc italic text-3xl leading-snug">{quoteText}</p>
              <p className="text-xs tracking-[0.2em] text-[#dfe7f8] mt-6 uppercase">{quoteSource}</p>
            </section>

            {/* COUPLE */}
            <section id="porselen-couple" data-panel-section="couple" className="px-6 py-24 space-y-16">
              <div className="reveal grid grid-cols-5 gap-5 items-end">
                <img
                  onClick={() => setLightboxImg(bridePortrait)}
                  alt="Mempelai wanita"
                  src={bridePortrait}
                  className="col-span-2 aspect-[3/5] object-cover rounded-t-full cursor-pointer hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="col-span-3 pb-4">
                  <p className="text-xs text-[#1d3b8f] tracking-[0.2em] uppercase">Mempelai wanita</p>
                  <h3 className="font-disp-porc text-4xl mt-2 leading-tight text-[#0e2260]">
                    {brideFullName}
                  </h3>
                  <p className="text-sm text-[#0e1730]/70 mt-3">
                    Putri dari <span>{brideParents}</span>
                  </p>
                </div>
              </div>

              <div className="reveal grid grid-cols-5 gap-5 items-end">
                <div className="col-span-3 pb-4 text-right">
                  <p className="text-xs text-[#1d3b8f] tracking-[0.2em] uppercase">Mempelai pria</p>
                  <h3 className="font-disp-porc text-4xl mt-2 leading-tight text-[#0e2260]">
                    {groomFullName}
                  </h3>
                  <p className="text-sm text-[#0e1730]/70 mt-3">
                    Putra dari <span>{groomParents}</span>
                  </p>
                </div>
                <img
                  onClick={() => setLightboxImg(groomPortrait)}
                  alt="Mempelai pria"
                  src={groomPortrait}
                  className="col-span-2 aspect-[3/5] object-cover rounded-t-full cursor-pointer hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
            </section>

            {/* EVENT */}
            <section id="porselen-event" data-panel-section="event" className="porc-tile text-white px-6 py-24">
              <h2 className="reveal font-disp-porc text-5xl text-center">Hitung Mundur</h2>
              <div className="reveal grid grid-cols-4 mt-8 text-center divide-x divide-white/30 border-y border-white/30 py-5">
                <div>
                  <p key={countdown.days} className="font-disp-porc text-4xl porc-tick">
                    {String(countdown.days).padStart(2, '0')}
                  </p>
                  <p className="text-[11px] text-[#dfe7f8]">Hari</p>
                </div>
                <div>
                  <p key={countdown.hours} className="font-disp-porc text-4xl porc-tick">
                    {String(countdown.hours).padStart(2, '0')}
                  </p>
                  <p className="text-[11px] text-[#dfe7f8]">Jam</p>
                </div>
                <div>
                  <p key={countdown.mins} className="font-disp-porc text-4xl porc-tick">
                    {String(countdown.mins).padStart(2, '0')}
                  </p>
                  <p className="text-[11px] text-[#dfe7f8]">Menit</p>
                </div>
                <div>
                  <p key={countdown.secs} className="font-disp-porc text-4xl porc-tick">
                    {String(countdown.secs).padStart(2, '0')}
                  </p>
                  <p className="text-[11px] text-[#dfe7f8]">Detik</p>
                </div>
              </div>

              <div className="mt-12 space-y-5">
                <article className="reveal porc-ticket bg-[#f6f7fa] text-[#0e1730] rounded-2xl p-8 text-center">
                  <p className="text-xs tracking-[0.2em] text-[#1d3b8f] uppercase">Akad nikah</p>
                  <p className="font-disp-porc text-5xl mt-2 text-[#0e2260]">{akadTime}</p>
                  <div className="border-t border-dashed border-[#c9d3ea] my-5" />
                  <p className="text-sm text-[#0e1730]/75 leading-relaxed">{akadVenue}</p>
                </article>

                <article className="reveal porc-ticket bg-[#f6f7fa] text-[#0e1730] rounded-2xl p-8 text-center">
                  <p className="text-xs tracking-[0.2em] text-[#1d3b8f] uppercase">Resepsi</p>
                  <p className="font-disp-porc text-5xl mt-2 text-[#0e2260]">{resepsiTime}</p>
                  <div className="border-t border-dashed border-[#c9d3ea] my-5" />
                  <p className="text-sm text-[#0e1730]/75 leading-relaxed">{resepsiVenue}</p>
                </article>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reveal block text-center border border-white rounded-full py-3 text-sm hover:bg-white hover:text-[#0e2260] transition"
                >
                  Buka petunjuk arah
                </a>
              </div>
            </section>

            {/* GALLERY */}
            <section className="py-24 px-4">
              <h2 className="reveal font-disp-porc text-5xl text-center text-[#0e2260] mb-10">
                Potret Kami
              </h2>
              <div className="reveal grid grid-cols-6 gap-2 auto-rows-[88px]">
                <img
                  onClick={() => setLightboxImg(galleryImages[0] || heroImage)}
                  alt="Galeri 1"
                  className="col-span-4 row-span-3 w-full h-full object-cover rounded-t-[999px] cursor-pointer hover:opacity-95 transition"
                  src={galleryImages[0] || heroImage}
                />
                <img
                  onClick={() => setLightboxImg(galleryImages[1] || bridePortrait)}
                  alt="Galeri 2"
                  className="col-span-2 row-span-2 w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                  src={galleryImages[1] || bridePortrait}
                />
                <img
                  onClick={() => setLightboxImg(galleryImages[2] || groomPortrait)}
                  alt="Galeri 3"
                  className="col-span-2 row-span-1 w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                  src={galleryImages[2] || groomPortrait}
                />
                <img
                  onClick={() => setLightboxImg(galleryImages[3] || ambientTexture)}
                  alt="Galeri 4"
                  className="col-span-3 row-span-2 w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                  src={galleryImages[3] || ambientTexture}
                />
                <img
                  onClick={() => setLightboxImg(galleryImages[4] || closingImage)}
                  alt="Galeri 5"
                  className="col-span-3 row-span-2 w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                  src={galleryImages[4] || closingImage}
                />
              </div>
            </section>

            {/* GIFT */}
            <section id="porselen-gift" data-panel-section="gift" className="px-6 pb-24">
              <h2 className="reveal font-disp-porc text-5xl text-center text-[#0e2260]">
                Tanda Kasih
              </h2>
              <p className="reveal text-sm text-[#0e1730]/70 text-center mt-4 leading-relaxed">
                Kehadiran dan doa Anda sudah cukup bagi kami. Bila ingin berbagi, kami menerimanya
                dengan syukur.
              </p>

              <div className="reveal porc-tile text-white rounded-3xl p-8 mt-10 relative">
                <p className="font-disp-porc italic text-2xl text-[#dfe7f8]">{bankName}</p>
                <p className="font-disp-porc text-4xl mt-8 tracking-wide">{accountNumber}</p>
                <p className="text-sm mt-2 text-[#dfe7f8]">
                  a.n. <span>{accountHolder}</span>
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(accountNumber, 'porc-acc-0')}
                  className="mt-7 bg-white text-[#0e2260] text-sm font-medium rounded-full px-6 py-2.5 hover:bg-[#dfe7f8] transition cursor-pointer"
                >
                  {clipboard.isCopied('porc-acc-0') ? 'Nomor Tersalin' : 'Salin nomor rekening'}
                </button>
              </div>
            </section>

            {/* RSVP */}
            <section id="porselen-rsvp" data-panel-section="rsvp" className="px-6 py-20 bg-[#dfe7f8]/60">
              <h2 className="reveal font-disp-porc text-5xl text-center text-[#0e2260]">
                Konfirmasi Kehadiran
              </h2>
              <form onSubmit={rsvp.submitRsvp} className="reveal mt-8 space-y-4">
                <input
                  required
                  value={rsvp.rsvpName}
                  onChange={(e) => rsvp.setRsvpName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full bg-white border border-[#c9d3ea] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1d3b8f]"
                />
                <select
                  value={rsvp.attendance}
                  onChange={(e) =>
                    rsvp.setAttendance(e.target.value as 'hadir' | 'ragu' | 'tidak_hadir')
                  }
                  className="w-full bg-white border border-[#c9d3ea] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1d3b8f]"
                >
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Tidak bisa hadir</option>
                  <option value="ragu">Masih ragu</option>
                </select>
                <select
                  value={rsvp.guestCount}
                  onChange={(e) => rsvp.setGuestCount(e.target.value)}
                  className="w-full bg-white border border-[#c9d3ea] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1d3b8f]"
                >
                  <option value="1">1 orang</option>
                  <option value="2">2 orang</option>
                  <option value="3">3 orang</option>
                  <option value="4">4 orang</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#1d3b8f] text-white rounded-full py-3 font-medium hover:bg-[#0e2260] transition cursor-pointer"
                >
                  Kirim konfirmasi
                </button>
              </form>
            </section>

            {/* WISHES / KOMENTAR */}
            <section id="porselen-wishes" data-panel-section="wishes" className="px-6 py-24">
              <h2 className="reveal font-disp-porc text-5xl text-center text-[#0e2260]">
                Ucapan &amp; Doa
              </h2>
              <p className="reveal text-sm text-[#0e1730]/70 text-center mt-3">
                <span>{guestbook.wishes.length}</span> ucapan dari keluarga dan sahabat
              </p>

              <form
                onSubmit={handleWishSubmit}
                className="reveal mt-8 bg-white border border-[#c9d3ea] rounded-2xl p-5 space-y-3"
              >
                <input
                  required
                  maxLength={40}
                  value={guestbook.nameInput}
                  onChange={(e) => guestbook.setNameInput(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full border-b border-[#c9d3ea] py-2.5 text-sm focus:outline-none focus:border-[#1d3b8f]"
                />
                <textarea
                  required
                  maxLength={300}
                  rows={3}
                  value={guestbook.messageInput}
                  onChange={(e) => guestbook.setMessageInput(e.target.value)}
                  placeholder="Tulis ucapan dan doa untuk kedua mempelai"
                  className="w-full border-b border-[#c9d3ea] py-2.5 text-sm resize-none focus:outline-none focus:border-[#1d3b8f]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#1d3b8f] text-white rounded-full py-3 text-sm font-medium hover:bg-[#0e2260] transition cursor-pointer"
                >
                  Kirim ucapan
                </button>
              </form>

              <ul className="mt-8 space-y-4 max-h-[440px] overflow-y-auto pr-1">
                {guestbook.wishes.map((w, idx) => {
                  const firstChar = w.name.trim().charAt(0).toUpperCase() || '?';
                  return (
                    <li
                      key={idx}
                      className="flex gap-3 bg-white border border-[#c9d3ea] rounded-2xl p-4"
                    >
                      <span className="shrink-0 w-10 h-10 rounded-full bg-[#1d3b8f] text-white font-disp-porc text-xl flex items-center justify-center">
                        {firstChar}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0e2260]">{w.name}</p>
                        <p className="text-sm text-[#0e1730]/80 mt-1 leading-relaxed break-words">
                          {w.message}
                        </p>
                        <p className="text-[11px] text-[#0e1730]/45 mt-2">
                          {w.time || 'Baru saja'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* CLOSING */}
            <section className="porc-tile text-white text-center px-8 pt-20 pb-40">
              <div
                className="reveal relative mx-auto w-44 cursor-pointer"
                onClick={() => setLightboxImg(closingImage)}
              >
                <img
                  alt="Penutup"
                  src={closingImage}
                  className="w-full aspect-[3/4] object-cover rounded-t-full"
                />
                <div className="absolute -inset-2 rounded-t-full border border-white/60 pointer-events-none" />
              </div>
              <p className="reveal font-disp-porc italic text-3xl mt-10 text-[#dfe7f8]">
                Terima kasih
              </p>
              <p className="reveal font-disp-porc text-5xl mt-2">
                <span>{brideName}</span> &amp; <span>{groomName}</span>
              </p>
            </section>
          </div>
        </main>
      </div>

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[200] bg-[#0e1730]/90 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
        >
          <img
            src={lightboxImg}
            alt="Pratinjau"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/30 shadow-2xl"
          />
        </div>
      )}

      {/* FLOATING DOCK */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex bg-white/95 backdrop-blur border border-[#c9d3ea] rounded-full p-1 text-[11px] shadow-lg"
        aria-label="Navigasi"
      >
        {PORSELEN_SLIDES.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-[#1d3b8f] text-white font-medium'
                  : 'text-[#0e1730] hover:bg-[#dfe7f8]/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* AUDIO TOGGLE */}
      {audio.hasAudio && (
        <button
          id="audio-toggle-btn"
          type="button"
          onClick={audio.toggleAudio}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white border border-[#c9d3ea] text-[#1d3b8f] flex items-center justify-center shadow cursor-pointer hover:bg-[#dfe7f8] transition"
          aria-label="Putar musik"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className={audio.isPlayingAudio ? 'animate-spin' : ''}
            style={{ animationDuration: '6s' }}
          >
            <path d="M9 18V6l10-2v12" />
            <circle cx="6.5" cy="18" r="2.5" />
            <circle cx="16.5" cy="16" r="2.5" />
          </svg>
        </button>
      )}

      {/* TOAST NOTIFICATION */}
      <div
        id="toast-notification"
        className={`fixed top-5 left-1/2 z-[120] bg-[#0e2260] text-white text-sm px-5 py-2.5 rounded-full pointer-events-none transition-all duration-300 shadow-lg ${
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
export default PorselenBiruTemplate;
