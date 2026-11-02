import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ClientInvitationData } from '../types/clientInvitation';
import { TEMPLATE_REGISTRY } from '../admin/templateRegistry';

interface KratonHeritageTemplateProps {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

interface WishItem {
  n: string;
  s: 'hadir' | 'no' | 'mb';
  m: string;
  t: string;
}

export const KratonHeritageTemplate: React.FC<KratonHeritageTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
}) => {
  const defaultMeta = TEMPLATE_REGISTRY['kraton-heritage']?.defaultData;

  // Resolve data
  const brideName = customData?.brideName || defaultMeta?.brideName || 'Sekar';
  const groomName = customData?.groomName || defaultMeta?.groomName || 'Danang';
  const brideFullName = customData?.brideFullName || defaultMeta?.brideFullName || 'Raden Ajeng Sekar Ayu Wardhani, S.Hum.';
  const groomFullName = customData?.groomFullName || defaultMeta?.groomFullName || 'Raden Mas Danang Pradipta Kusumo, M.B.A.';
  const brideParents = customData?.brideParents || defaultMeta?.brideParents || 'Putri tercinta K.P.H. Haryo Danusubroto & R.Ay. Kusuma Ningrum';
  const groomParents = customData?.groomParents || defaultMeta?.groomParents || 'Putra tercinta K.R.T. Suryo Hadikusumo & R.Ay. Sri Handayani';

  const eventDateFormatted = customData?.eventDateFormatted || defaultMeta?.eventDateFormatted || 'Sabtu Kliwon, 28 November 2026';
  const countdownIso = customData?.countdownIsoDate || defaultMeta?.countdownIsoDate || '2026-11-28T08:00:00+07:00';

  const akadTime = customData?.akadTime || defaultMeta?.akadTime || '08.00 – 10.00 WIB';
  const akadVenue = customData?.akadVenue || defaultMeta?.akadVenue || 'Gedhong Dalem Ageng Pringgitan, Sasana Adiguna';
  const resepsiTime = customData?.resepsiTime || defaultMeta?.resepsiTime || '11.00 – 14.30 WIB';
  const resepsiVenue = customData?.resepsiVenue || defaultMeta?.resepsiVenue || 'Pendopo Sasana Kencana, Jl. Danurejan No. 8';
  const city = customData?.city || defaultMeta?.city || 'Yogyakarta';
  const mapsUrl = customData?.mapsUrl || defaultMeta?.mapsUrl || 'https://maps.google.com';

  const quoteText = customData?.quoteText || defaultMeta?.quoteText || 'Mulat sarira angrasa wani, memayu hayuning bawana. Katresnan kang tulus sejati liring lintang panjer rina, nyawiji lahir batin salaminya.';
  const quoteSource = customData?.quoteSource || defaultMeta?.quoteSource || 'Serat Pustaka Kencana · 2026';

  const bankName = customData?.bankName || defaultMeta?.bankName || 'BANK BCA';
  const accountNumber = customData?.accountNumber || defaultMeta?.accountNumber || '8910 2831 09';
  const accountHolder = customData?.accountHolder || defaultMeta?.accountHolder || 'R.A. Sekar Ayu Wardhani';

  const secondaryBankName = customData?.secondaryBankName || defaultMeta?.secondaryBankName || 'BANK MANDIRI';
  const secondaryAccountNumber = customData?.secondaryAccountNumber || defaultMeta?.secondaryAccountNumber || '1370 0928 1729 0';
  const secondaryAccountHolder = customData?.secondaryAccountHolder || defaultMeta?.secondaryAccountHolder || 'R.M. Danang Pradipta Kusumo';

  const audioUrl = customData?.audioUrl || defaultMeta?.audioUrl || '';

  // Images
  const heroImage = customData?.mediaSlots?.heroImage || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80';
  const spotlightImage = customData?.mediaSlots?.spotlightImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1400&q=75';
  const closingImage = customData?.mediaSlots?.closingImage || 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1400&q=75';
  const bridePortrait = customData?.mediaSlots?.bridePortrait || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=700&q=75';
  const groomPortrait = customData?.mediaSlots?.groomPortrait || 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=700&q=75';

  const rawGallery = customData?.mediaSlots?.galleryImages;
  const galleryImages: string[] = rawGallery && rawGallery.length > 0 ? rawGallery : [
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=75'
  ];

  // Guest recipient
  const [guestName, setGuestName] = useState('Tamu Undangan');
  useEffect(() => {
    try {
      const gq = new URLSearchParams(window.location.search).get('to');
      if (gq) setGuestName(gq);
    } catch {}
  }, []);

  // Cover state
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'akad' | 'resepsi'>('akad');
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);

  // Stage Scene state
  const [currentScene, setCurrentScene] = useState<string>('hero');
  const colRef = useRef<HTMLElement | null>(null);

  // Toast
  const [toastText, setToastText] = useState<string | null>(null);
  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2400);
  };

  // Lightbox
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  // RSVP Form & Wishes
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'no' | 'mb'>('hadir');
  const [rsvpMsg, setRsvpMsg] = useState('');
  const [wishes, setWishes] = useState<WishItem[]>([
    {
      n: 'K.P.H. Joyokusumo & Keluarga',
      s: 'hadir',
      m: 'Nderek mangayubagya. Mugi tansah pinaringan berkah, rahayu widada nir ing sambekala.',
      t: '2 jam lalu'
    },
    {
      n: 'Dr. Budi Santoso & Ny. Retno',
      s: 'hadir',
      m: 'Selamat menempuh babak baru. Doa restu kami menyertai ananda berdua.',
      t: '5 jam lalu'
    }
  ]);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(countdownIso).getTime() - Date.now());
      const d = String(Math.floor(diff / 864e5)).padStart(2, '0');
      const h = String(Math.floor((diff / 36e5) % 24)).padStart(2, '0');
      const m = String(Math.floor((diff / 6e4) % 60)).padStart(2, '0');
      const s = String(Math.floor((diff / 1e3) % 60)).padStart(2, '0');
      setTimeLeft({ d, h, m, s });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [countdownIso]);

  // Canvas Gold Dust
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dustRef = useRef<any[]>([]);
  const burstRef = useRef<(x: number, y: number) => void>(() => {});

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;

    let animId: number;

    const fit = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    fit();
    window.addEventListener('resize', fit);

    const initial: any[] = [];
    for (let k = 0; k < 38; k++) {
      initial.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.8 + 0.4,
        v: Math.random() * 0.35 + 0.1,
        a: Math.random(),
        dx: 0,
        dy: 0,
        l: 0
      });
    }
    dustRef.current = initial;

    burstRef.current = (x: number, y: number) => {
      for (let i = 0; i < 46; i++) {
        const a = Math.random() * 6.28;
        const s = Math.random() * 5 + 1;
        dustRef.current.push({
          x,
          y,
          r: Math.random() * 2 + 0.6,
          v: 0,
          a: 1,
          dx: Math.cos(a) * s,
          dy: Math.sin(a) * s,
          l: 1
        });
      }
    };

    const loop = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      dustRef.current = dustRef.current.filter((p) => {
        if (p.l) {
          p.x += p.dx;
          p.y += p.dy;
          p.dy += 0.08;
          p.dx *= 0.98;
          p.a -= 0.014;
          if (p.a <= 0) return false;
        } else {
          p.y -= p.v;
          p.a += (Math.random() - 0.5) * 0.06;
          if (p.y < -5) {
            p.y = cv.height + 5;
            p.x = Math.random() * cv.width;
          }
        }
        cx.globalAlpha = Math.max(0, Math.min(1, Math.abs(p.a))) * 0.8;
        cx.fillStyle = '#F6E27A';
        cx.beginPath();
        cx.arc(p.x, p.y, p.r, 0, 6.28);
        cx.fill();
        return true;
      });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', fit);
    };
  }, []);

  // Handle open gate
  const handleOpenGate = () => {
    setIsOpen(true);
    burstRef.current(window.innerWidth / 2, window.innerHeight / 2);
    if (audioRef.current && audioUrl) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (!audioUrl) {
      showToast('Belum ada musik diatur');
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  // Stage Scene Definitions with real photographic images per section
  const SCENES = [
    {
      k: 'hero',
      t: 'Gerbang Kori Agung',
      c: 'Pawiwahan Ageng',
      img: heroImage
    },
    {
      k: 'quote',
      t: 'Mulat Sarira',
      c: 'Sesanti',
      img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=75'
    },
    {
      k: 'couple',
      t: 'Kakung & Putri',
      c: 'Mempelai',
      img: bridePortrait
    },
    {
      k: 'event',
      t: 'Pendopo Sasana Kencana',
      c: 'Tata Titilaksana',
      img: spotlightImage
    },
    {
      k: 'gallery',
      t: 'Titian Katresnan',
      c: 'Galeri',
      img: galleryImages[0] || heroImage
    },
    {
      k: 'gift',
      t: 'Tanda Tresna',
      c: 'Kado Kencana',
      img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=75'
    },
    {
      k: 'rsvp',
      t: 'Sesanti Restu',
      c: 'Konfirmasi',
      img: groomPortrait || heroImage
    },
    {
      k: 'close',
      t: 'Matur Nuwun',
      c: 'Rahayu',
      img: closingImage || heroImage
    }
  ];

  // Parallax scroll handler for left column
  const handleColScroll = () => {
    const col = colRef.current;
    if (!col) return;
    const cr = col.getBoundingClientRect();
    const cm = cr.top + cr.height / 2;
    const pbgEls = col.querySelectorAll<HTMLElement>('.kt-pbg');
    pbgEls.forEach((b) => {
      const parent = b.closest('.kt-bgwrap, section.hasbg');
      if (parent) {
        const p = parent.getBoundingClientRect();
        const offset = -((p.top + p.height / 2 - cm) * 0.14);
        b.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    });
  };

  // Parallax mouse move on right stage
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      const x = ((e.clientX / window.innerWidth) - 0.5) * -24;
      const y = ((e.clientY / window.innerHeight) - 0.5) * -24;
      const activeImg = document.querySelector<HTMLElement>('.kt-scene.on .kt-scene-img');
      if (activeImg) {
        activeImg.style.translate = `${x}px ${y}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Observers for scene changes & reveals
  useEffect(() => {
    const col = colRef.current;
    if (!col) return;

    const sceneEls = col.querySelectorAll<HTMLElement>('[data-scene]');
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.35) {
            const sc = (e.target as HTMLElement).dataset.scene;
            if (sc) setCurrentScene(sc);
          }
        });
      },
      { root: col, threshold: [0.35, 0.6] }
    );
    sceneEls.forEach((el) => so.observe(el));

    const rvEls = col.querySelectorAll<HTMLElement>('.rv');
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle('in', e.isIntersecting);
        });
      },
      { root: col, threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
    );
    rvEls.forEach((el) => ro.observe(el));
    handleColScroll();

    return () => {
      so.disconnect();
      ro.disconnect();
    };
  }, [isOpen]);

  // Tab switch
  const handleTabClick = (tab: 'akad' | 'resepsi', btnEl: HTMLButtonElement) => {
    setActiveTab(tab);
    if (pillRef.current) {
      pillRef.current.style.left = `${btnEl.offsetLeft}px`;
      pillRef.current.style.width = `${btnEl.offsetWidth}px`;
    }
  };

  // Copy
  const handleCopy = (text: string) => {
    const clean = text.replace(/\s+/g, '');
    try {
      navigator.clipboard.writeText(clean).then(
        () => showToast('Nomor rekening disalin'),
        () => showToast(`Salin manual: ${clean}`)
      );
    } catch {
      showToast(`Salin manual: ${clean}`);
    }
  };

  // RSVP Submit
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    const newWish: WishItem = {
      n: rsvpName.trim(),
      s: rsvpStatus,
      m: rsvpMsg.trim() || 'Selamat dan doa restu terbaik untuk kedua mempelai.',
      t: 'Baru saja'
    };
    setWishes([newWish, ...wishes]);
    setRsvpName('');
    setRsvpMsg('');
    showToast('Matur nuwun, sesanti sampun katampi');
    burstRef.current(window.innerWidth / 2, window.innerHeight / 2);
  };

  // Calendar URL
  const calDates = countdownIso.replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Pernikahan ${brideName} & ${groomName}`
  )}&location=${encodeURIComponent(`${resepsiVenue}, ${city}`)}&dates=${calDates}/${calDates}`;

  return (
    <div className="kraton-root">
      {/* Exact CSS from Kraton Heritage · Sekar & Danang.html */}
      <style>{`
        .kraton-root {
          --bg: #12100E;
          --card: #1A1614;
          --wine: #2B070D;
          --gold: #D4AF37;
          --gold2: #F6E27A;
          --text: #FBF8F1;
          --mute: #A89874;
          --line: rgba(212,175,55,0.3);
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans: 'Jost', system-ui, sans-serif;
          position: fixed;
          inset: 0;
          background: var(--bg);
          color: var(--text);
          font-family: var(--serif);
          overflow: hidden;
          z-index: 50;
        }

        .kraton-root *,
        .kraton-root *::before,
        .kraton-root *::after {
          box-sizing: border-box;
          margin: 0;
        }

        .kt-app {
          display: grid;
          grid-template-columns: 1fr;
          height: 100%;
        }

        .kt-col {
          position: relative;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: smooth;
          background: var(--bg);
          scrollbar-width: none;
        }
        .kt-col::-webkit-scrollbar { width: 0; display: none; }

        .kt-stage {
          display: none;
          position: relative;
          overflow: hidden;
          background: #0b0908;
        }

        @media(min-width: 1024px) {
          .kt-app {
            grid-template-columns: minmax(420px, 480px) 1fr;
          }
          .kt-stage {
            display: block;
            order: 2;
          }
          .kt-col {
            order: 1;
            border-right: 1px solid var(--line);
            box-shadow: 20px 0 60px rgba(0,0,0,0.6);
            z-index: 2;
          }
        }

        /* STAGE SCENE */
        .kt-scene {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.4s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .kt-scene.on {
          opacity: 1;
        }
        .kt-scene-bg-wrap {
          position: absolute;
          inset: -8%;
          overflow: hidden;
        }
        .kt-scene-img {
          width: 116%;
          height: 116%;
          object-fit: cover;
          filter: brightness(0.55) contrast(1.12);
          animation: kt-ken 24s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes kt-ken {
          to { transform: scale(1.12) translate(-1.5%, 1%); }
        }
        .kt-scene-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(18,16,14,0.1) 15%, rgba(11,9,8,0.75) 70%, #0b0908 100%),
                      linear-gradient(to top, #0b0908 0%, transparent 35%, transparent 65%, #0b0908 100%);
          z-index: 2;
        }

        .kt-cap {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 7%;
          text-align: center;
          z-index: 3;
          transform: translateY(20px);
          opacity: 0;
          transition: all 1s 0.5s;
        }
        .kt-scene.on .kt-cap {
          transform: none;
          opacity: 1;
        }
        .kt-cap small {
          font: 500 11px var(--sans);
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--gold);
          display: block;
        }
        .kt-cap h3 {
          font-weight: 400;
          font-size: clamp(28px, 3.4vw, 52px);
          color: var(--gold2);
          margin-top: 6px;
          font-style: italic;
        }
        .kt-vig {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: radial-gradient(circle at center, transparent 25%, #0b0908 95%);
        }
        .kt-stage-ui {
          position: absolute;
          top: 22px;
          left: 26px;
          z-index: 5;
          font: 500 11px var(--sans);
          letter-spacing: 0.35em;
          color: var(--gold);
          text-transform: uppercase;
        }
        .kt-prog {
          position: absolute;
          right: 26px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font: 500 10px var(--sans);
          color: var(--mute);
          letter-spacing: 0.2em;
        }
        .kt-prog span {
          transition: all 0.5s;
        }
        .kt-prog span.on {
          color: var(--gold2);
          transform: translateX(-8px);
        }

        /* GATE / COVER */
        .kt-gate {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: block;
          background: #0b0908;
          overflow: hidden;
          transition: opacity 0.4s 1.6s;
        }
        .kt-gate.open {
          pointer-events: none;
          opacity: 0;
        }
        .kt-cv-bg {
          position: absolute;
          inset: -4%;
          background-color: #150e0c;
          background-image: radial-gradient(circle at 30% 15%, rgba(170,119,28,0.4), transparent 55%),
                            radial-gradient(circle at 80% 80%, rgba(110,20,36,0.7), transparent 60%);
          background-size: cover;
          background-position: center;
          filter: blur(3px) brightness(0.45);
        }
        .kt-cv-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 25%, #0b0908 95%);
        }
        .kt-cv-in {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(8px, 1.8vh, 16px);
          padding: 16px 20px;
          text-align: center;
        }
        .kt-a {
          opacity: 0;
          transform: translateY(22px);
          animation: kt-gin 1s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          animation-delay: calc(var(--d, 0) * 1s);
        }
        @keyframes kt-gin {
          to { opacity: 1; transform: none; }
        }
        .kt-gate.open .kt-a {
          animation: kt-gout 0.5s forwards;
        }
        @keyframes kt-gout {
          to { opacity: 0; transform: translateY(-14px); }
        }
        .kt-cv-arch {
          width: min(260px, 64vw);
          height: min(40vh, 380px);
          border: 1px solid var(--gold);
          border-radius: 999px 999px 0 0;
          padding: 7px;
          box-shadow: 0 0 60px rgba(212,175,55,0.25);
          animation: kt-archin 1.6s 0.3s cubic-bezier(0.6, 0, 0.2, 1) backwards;
          transition: transform 1.5s cubic-bezier(0.7, 0, 0.2, 1), opacity 1s 0.6s;
        }
        @keyframes kt-archin {
          from { clip-path: inset(100% 0 0 0); }
          to { clip-path: inset(0); }
        }
        .kt-gate.open .kt-cv-arch {
          transform: scale(7);
          opacity: 0;
        }
        .kt-cv-win {
          width: 100%;
          height: 100%;
          border-radius: 999px 999px 0 0;
          overflow: hidden;
          background-color: #1a1210;
          background-image: linear-gradient(160deg, #4a1520, #1a1210);
          background-size: cover;
          background-position: center;
          display: grid;
          place-items: center;
          font-size: 70px;
          color: var(--gold);
        }
        .kt-cv-top {
          font: 500 11px var(--sans);
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .kt-cv-names {
          font-size: min(11vw, 7.5vh, 56px);
          line-height: 1;
          font-weight: 400;
        }
        .kt-cv-names i {
          color: var(--gold);
          font-style: italic;
          margin: 0 0.15em;
        }
        .kt-cv-date {
          font: 500 11px var(--sans);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold2);
        }
        .kt-cv-guest small {
          display: block;
          font: 300 11px var(--sans);
          color: var(--mute);
          margin-bottom: 2px;
        }
        .kt-cv-guest b {
          font: 400 20px var(--serif);
          color: var(--text);
        }
        .kt-cv-btn {
          position: relative;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: rgba(43,7,13,0.6);
          backdrop-filter: blur(6px);
          cursor: pointer;
          padding: 0;
          color: var(--gold2);
          transition: transform 0.4s, box-shadow 0.4s;
        }
        .kt-cv-btn:hover {
          transform: scale(1.08) !important;
          box-shadow: 0 0 36px rgba(212,175,55,0.45);
        }
        .kt-cv-btn svg {
          width: 100%;
          height: 100%;
          animation: kt-spin 14s linear infinite;
        }
        @keyframes kt-spin {
          to { transform: rotate(360deg); }
        }
        .kt-cv-btn text {
          font: 500 9px var(--sans);
          fill: #F6E27A;
        }
        .kt-cv-btn span {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-size: 26px;
        }

        /* SECTIONS & FIXED BACKGROUND PARALLAX */
        .kt-col section {
          position: relative;
          padding: 84px 26px;
          text-align: center;
          border-bottom: 1px solid var(--line);
        }
        .kt-col section.hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding-top: 60px;
        }

        .kt-bgwrap {
          position: relative;
        }
        .kt-col section.hasbg {
          position: relative;
          color: #fff7ea;
          border-color: transparent;
        }

        .kt-sticky-bg {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          margin-bottom: -100vh;
          margin-bottom: -100dvh;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .kt-sticky-bg .kt-pbg {
          position: absolute;
          top: -12%;
          bottom: -12%;
          left: 0;
          right: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-color: #1a1210;
          will-change: transform;
        }
        .kt-sticky-bg .kt-pbg::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(var(--bg) 0%, rgba(18,16,14,0.6) 15%, rgba(18,16,14,0.6) 85%, var(--bg) 100%);
        }

        /* Sections that explicitly have NO background photo (solid obsidian) */
        .kt-col section[data-scene="couple"],
        .kt-col section[data-scene="gallery"],
        .kt-col section[data-scene="gift"],
        .kt-col footer[data-scene="close"] {
          background: var(--bg);
          position: relative;
          z-index: 2;
        }

        .kt-col section > * {
          position: relative;
          z-index: 2;
        }
        .kt-col h2 {
          font-weight: 400;
          font-size: 34px;
          line-height: 1.15;
          margin: 8px 0 14px;
        }
        .kt-col h2 em, .kt-names em {
          color: var(--gold);
          font-style: italic;
        }
        .kt-names {
          font-weight: 400;
          font-size: clamp(46px, 13vw, 64px);
          line-height: 1;
          margin: 14px 0;
        }
        .kt-eyebrow {
          font: 500 11px var(--sans);
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .kt-rule {
          width: 90px;
          height: 1px;
          margin: 16px auto;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }
        .kt-sans {
          font: 300 13px/1.7 var(--sans);
          color: var(--mute);
        }
        .kt-date {
          font: 500 12px var(--sans);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold2);
        }
        .kt-quote {
          font-size: 21px;
          font-style: italic;
          line-height: 1.55;
          color: #E5C158;
        }

        /* REVEALS */
        .rv {
          opacity: 0;
          transform: translateY(28px);
          filter: blur(4px);
          transition: all 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .rv.in {
          opacity: 1;
          transform: none;
          filter: none;
        }
        .rv.d1 { transition-delay: 0.15s; }
        .rv.d2 { transition-delay: 0.3s; }
        .rv.d3 { transition-delay: 0.45s; }
        .rv.l { translate: -50px 0; }
        .rv.r { translate: 50px 0; }
        .rv.zoom { scale: 0.85; }
        .rv.l.in, .rv.r.in { translate: 0 0; }
        .rv.zoom.in { scale: 1; }

        .kt-btn {
          font: 600 11px var(--sans);
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 14px 26px;
          border: 0;
          border-radius: 99px;
          color: #12100E;
          background: linear-gradient(90deg, #AA771C, var(--gold), var(--gold2));
          background-size: 200% 100%;
          cursor: pointer;
          transition: all 0.4s;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          display: inline-block;
        }
        .kt-btn:hover {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212,175,55,0.4);
        }
        .kt-btn.ghost {
          background: transparent;
          color: var(--gold2);
          border: 1px solid var(--line);
        }

        /* COUNTDOWN */
        .kt-cd {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 30px;
          width: 100%;
          max-width: 340px;
        }
        .kt-cd div {
          padding: 12px 0;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: rgba(43,7,13,0.5);
        }
        .kt-cd b {
          display: block;
          font: 600 28px var(--serif);
          color: var(--gold2);
          font-variant-numeric: tabular-nums;
        }
        .kt-cd small {
          font: 400 9px var(--sans);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--mute);
        }
        .kt-scroll {
          margin-top: 30px;
          width: 22px;
          height: 36px;
          border: 1px solid var(--gold);
          border-radius: 12px;
          position: relative;
        }
        .kt-scroll::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 6px;
          width: 3px;
          height: 7px;
          margin-left: -1.5px;
          border-radius: 3px;
          background: var(--gold2);
          animation: kt-sc 1.6s infinite;
        }
        @keyframes kt-sc {
          to { transform: translateY(14px); opacity: 0; }
        }

        /* COUPLE */
        .kt-person {
          margin: 28px 0;
        }
        .kt-arch {
          width: 200px;
          height: 270px;
          margin: 0 auto 16px;
          border-radius: 100px 100px 6px 6px;
          overflow: hidden;
          border: 1px solid var(--gold);
          padding: 5px;
          position: relative;
        }
        .kt-arch .kt-ph {
          width: 100%;
          height: 100%;
          border-radius: 96px 96px 4px 4px;
          background-size: cover;
          background-position: center;
          transition: transform 1.2s;
        }
        .kt-person:hover .kt-ph {
          transform: scale(1.07);
        }
        .kt-person h3 {
          font-weight: 400;
          font-size: 25px;
          color: var(--gold2);
        }
        .kt-amp {
          font-size: 40px;
          color: var(--gold);
          font-style: italic;
          animation: kt-pulse 3s infinite;
        }
        @keyframes kt-pulse {
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        /* TABS & EVENT */
        .kt-tabs {
          display: inline-flex;
          padding: 4px;
          border: 1px solid var(--line);
          border-radius: 99px;
          margin: 10px 0 22px;
          position: relative;
        }
        .kt-tabs button {
          position: relative;
          z-index: 1;
          font: 600 10px var(--sans);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 11px 18px;
          border: 0;
          background: none;
          color: var(--mute);
          cursor: pointer;
          transition: color 0.4s;
        }
        .kt-tabs button.on {
          color: #12100E;
        }
        .kt-pill {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 4px;
          border-radius: 99px;
          background: linear-gradient(90deg, #AA771C, var(--gold2));
          transition: all 0.45s cubic-bezier(0.6, 0, 0.2, 1);
        }
        .kt-ev {
          padding: 28px 22px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(26,22,20,0.9);
          text-align: left;
          min-height: 210px;
        }
        .kt-ev h3 {
          font-weight: 400;
          font-size: 26px;
          color: var(--gold2);
          margin-bottom: 14px;
        }
        .kt-ev p {
          font: 400 13px/1.5 var(--sans);
          color: var(--gold2);
          margin-bottom: 12px;
        }
        .kt-ev p span {
          display: block;
          font-weight: 300;
          color: var(--mute);
        }
        .kt-row {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .kt-row .kt-btn {
          flex: 1;
          min-width: 140px;
          text-align: center;
          padding: 13px 10px;
          font-size: 10px;
        }

        /* TIMELINE */
        .kt-tl {
          text-align: left;
          margin-top: 26px;
          position: relative;
          padding-left: 26px;
        }
        .kt-tl::before {
          content: "";
          position: absolute;
          left: 5px;
          top: 6px;
          bottom: 6px;
          width: 1px;
          background: linear-gradient(var(--gold), transparent);
        }
        .kt-tl div {
          position: relative;
          margin-bottom: 22px;
        }
        .kt-tl div::before {
          content: "";
          position: absolute;
          left: -26px;
          top: 7px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--bg);
          border: 1px solid var(--gold);
        }
        .kt-tl h4 {
          font-weight: 400;
          font-size: 20px;
          color: var(--gold2);
        }

        /* GALLERY */
        .kt-gal {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }
        .kt-gal .kt-g {
          aspect-ratio: 3/4;
          border-radius: 12px;
          border: 1px solid var(--line);
          background-size: cover;
          background-position: center;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.5s;
        }
        .kt-gal .kt-g:nth-child(2n) {
          transform: translateY(18px);
        }
        .kt-gal .kt-g:hover {
          transform: scale(1.04);
        }

        /* LIGHTBOX */
        .kt-lb {
          position: fixed;
          inset: 0;
          z-index: 110;
          background: rgba(0,0,0,0.94);
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .kt-lb.on {
          display: flex;
        }
        .kt-lb .kt-big {
          width: min(90vw, 520px);
          aspect-ratio: 3/4;
          border-radius: 14px;
          border: 1px solid var(--gold);
          background-size: cover;
          background-position: center;
        }
        .kt-lb button {
          position: absolute;
          background: rgba(255,255,255,0.1);
          border: 0;
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 22px;
          cursor: pointer;
        }

        /* GIFT */
        .kt-acc {
          padding: 20px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--card);
          margin-top: 14px;
          text-align: left;
        }
        .kt-acc small {
          font: 600 10px var(--sans);
          letter-spacing: 0.25em;
          color: var(--gold);
        }
        .kt-acc b {
          display: block;
          font: 500 22px ui-monospace, Menlo, monospace;
          color: var(--gold2);
          margin: 6px 0 2px;
          letter-spacing: 0.05em;
        }

        /* RSVP */
        .kt-form {
          text-align: left;
          margin-top: 22px;
          display: grid;
          gap: 12px;
        }
        .kt-form label {
          font: 600 10px var(--sans);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .kt-form input, .kt-form select, .kt-form textarea {
          width: 100%;
          margin-top: 5px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #0e0c0b;
          color: var(--text);
          font: 400 13px var(--sans);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .kt-form input:focus, .kt-form select:focus, .kt-form textarea:focus {
          outline: 0;
          border-color: var(--gold2);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.15);
        }
        .kt-wish {
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: var(--card);
          text-align: left;
          margin-top: 12px;
        }
        .kt-wish header {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font: 600 12px var(--sans);
          color: var(--gold2);
        }
        .kt-wish i {
          font: 600 9px var(--sans);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 99px;
          border: 1px solid var(--gold);
          color: var(--gold);
          white-space: nowrap;
          align-self: flex-start;
          font-style: normal;
        }
        .kt-wish i.no {
          border-color: #8a3a46;
          color: #d98a96;
        }
        .kt-wish i.mb {
          border-color: var(--mute);
          color: var(--mute);
        }
        .kt-wish p {
          font-size: 16px;
          font-style: italic;
          color: #E5C158;
          margin-top: 6px;
          line-height: 1.4;
        }

        /* CLOSING SEAL */
        .kt-seal {
          width: 76px;
          height: 76px;
          margin: 0 auto 14px;
          border-radius: 50%;
          border: 1px solid var(--gold);
          display: grid;
          place-items: center;
          background: var(--wine);
          font-size: 22px;
          color: var(--gold2);
          position: relative;
        }
        .kt-seal::after {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1px dashed var(--gold);
          opacity: 0.6;
          animation: kt-spin 18s linear infinite;
        }

        /* FLOATING MUSIC */
        .kt-music {
          position: fixed;
          z-index: 60;
          right: 16px;
          bottom: 20px;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid var(--gold);
          background: rgba(26,22,20,0.92);
          color: var(--gold2);
          cursor: pointer;
          display: grid;
          place-items: center;
          font-size: 18px;
        }
        .kt-music.play {
          animation: kt-spin 6s linear infinite;
        }
        @media(min-width: 1024px) {
          .kt-music {
            right: auto;
            left: calc(min(480px, 100vw) - 62px);
          }
        }

        /* TOAST */
        .kt-toast {
          position: fixed;
          left: 50%;
          bottom: 90px;
          transform: translate(-50%, 20px);
          z-index: 120;
          padding: 10px 20px;
          border-radius: 99px;
          background: var(--gold);
          color: #12100E;
          font: 600 12px var(--sans);
          opacity: 0;
          transition: all 0.4s;
          pointer-events: none;
        }
        .kt-toast.on {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        #kt-dust {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 130;
        }
      `}</style>

      {/* Audio player */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop preload="none" />}

      {/* Top Bar for Catalog / Order CTA (No "Demo React" badge) */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#12100E]/90 backdrop-blur-md border-b border-[#D4AF37]/30 px-4 py-2 flex items-center justify-between text-xs font-sans">
        {onBackToLanding ? (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-[#F6E27A] hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </button>
        ) : (
          <span className="text-[#D4AF37] tracking-widest uppercase text-[10px]">Atelier Sekarsiti</span>
        )}
        <span className="text-[11px] uppercase tracking-widest text-[#F6E27A] font-semibold">
          Seri No. 14 · Royal Kraton
        </span>
        {onOrderViaWhatsApp && (
          <button
            onClick={onOrderViaWhatsApp}
            className="bg-gradient-to-r from-[#AA771C] via-[#D4AF37] to-[#F6E27A] text-[#12100E] px-3.5 py-1 rounded-full text-[11px] font-bold hover:brightness-110 transition cursor-pointer"
          >
            Pesan Desain Ini
          </button>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 1. COVER GATE (GERBANG KORI AGUNG KRATON) */}
      {/* ========================================================================= */}
      <div className={`kt-gate ${isOpen ? 'open' : ''}`}>
        <div className="kt-cv-bg" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="kt-cv-in">
          <div className="kt-a kt-cv-top" style={{ ['--d' as any]: 0.2 }}>
            Pawiwahan Ageng · Kraton
          </div>
          <div className="kt-cv-arch">
            <div className="kt-cv-win" style={{ backgroundImage: `url(${heroImage})` }}>
              ❦
            </div>
          </div>
          <div className="kt-a kt-cv-names" style={{ ['--d' as any]: 1.2 }}>
            <span>{brideName}</span>
            <i>&amp;</i>
            <span>{groomName}</span>
          </div>
          <div className="kt-a kt-cv-date" style={{ ['--d' as any]: 1.4 }}>
            {eventDateFormatted}
          </div>
          <div className="kt-a kt-cv-guest" style={{ ['--d' as any]: 1.6 }}>
            <small>Kepada Yth.</small>
            <b>{guestName}</b>
          </div>
          <button
            className="kt-a kt-cv-btn"
            style={{ ['--d' as any]: 1.8 }}
            onClick={handleOpenGate}
            aria-label="Buka undangan"
          >
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="kt-cp" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
              </defs>
              <text>
                <textPath href="#kt-cp" textLength="284" lengthAdjust="spacing">
                  BUKA UNDANGAN • BUKA UNDANGAN •{' '}
                </textPath>
              </text>
            </svg>
            <span>❦</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN APP: 2 COLUMNS (LEFT MOBILE SCROLL + RIGHT DESKTOP STAGE) */}
      {/* ========================================================================= */}
      <div className="kt-app pt-10">
        {/* LEFT COLUMN: SCROLLABLE CONTENT */}
        <main className="kt-col" ref={colRef} onScroll={handleColScroll}>
          <div className="kt-bgwrap">
            <div className="kt-sticky-bg">
              <div className="kt-pbg" style={{ backgroundImage: `url(${heroImage})` }} />
            </div>

            {/* SECTION 1: HERO */}
            <section className="hero" data-scene="hero">
              <div className="kt-eyebrow rv">Nawala Palakrama Suci</div>
              <h1 className="kt-names rv d1">
                <span>{brideName}</span>
                <br />
                <em>&amp;</em>
                <br />
                <span>{groomName}</span>
              </h1>
              <div className="kt-rule rv d2" />
              <div className="kt-date rv d2">{eventDateFormatted}</div>
              <p className="kt-sans rv d3" style={{ marginTop: '6px' }}>
                <span>{resepsiVenue}</span> · <span>{city}</span>
              </p>
              <div className="kt-cd rv d3">
                <div>
                  <b>{timeLeft.d}</b>
                  <small>Dina</small>
                </div>
                <div>
                  <b>{timeLeft.h}</b>
                  <small>Jam</small>
                </div>
                <div>
                  <b>{timeLeft.m}</b>
                  <small>Menit</small>
                </div>
                <div>
                  <b>{timeLeft.s}</b>
                  <small>Detik</small>
                </div>
              </div>
              <div className="kt-scroll" />
            </section>

            {/* SECTION 2: QUOTE / SESANTI */}
            <section data-scene="quote">
              <div className="kt-eyebrow rv">Sesanti</div>
              <h2 className="rv d1">
                Mulat Sarira <em>Angrasa Wani</em>
              </h2>
              <p className="kt-quote rv d2">&ldquo;{quoteText}&rdquo;</p>
              <div className="kt-rule rv d3" />
              <p className="kt-sans rv d3">{quoteSource}</p>
            </section>
          </div>

          {/* SECTION 3: COUPLE */}
          <section data-scene="couple">
            <div className="kt-eyebrow rv">Panyambrama Pinisepuh</div>
            <h2 className="rv d1">
              Mempelai <em>Kakung</em> &amp; <em>Putri</em>
            </h2>

            <div className="kt-person rv">
              <div className="kt-arch">
                <div className="kt-ph" style={{ backgroundImage: `url(${bridePortrait})` }}>
                  ❦
                </div>
              </div>
              <div className="kt-eyebrow">Mempelai Putri</div>
              <h3>{brideFullName}</h3>
              <p className="kt-sans">{brideParents}</p>
            </div>

            <div className="kt-amp">&amp;</div>

            <div className="kt-person rv">
              <div className="kt-arch">
                <div className="kt-ph" style={{ backgroundImage: `url(${groomPortrait})` }}>
                  ❦
                </div>
              </div>
              <div className="kt-eyebrow">Mempelai Kakung</div>
              <h3>{groomFullName}</h3>
              <p className="kt-sans">{groomParents}</p>
            </div>
          </section>

          {/* SECTION 4: EVENT & JADWAL */}
          <section data-scene="event" className="hasbg">
            <div className="kt-sticky-bg">
              <div className="kt-pbg" style={{ backgroundImage: `url(${spotlightImage})` }} />
            </div>
            <div className="kt-eyebrow rv">Tata Titilaksana</div>
            <h2 className="rv d1">
              Reroncen <em>Palakrama Suci</em>
            </h2>

            <div className="kt-tabs rv d2" ref={tabsRef}>
              <span className="kt-pill" ref={pillRef} style={{ left: activeTab === 'akad' ? '4px' : '50%' }} />
              <button
                className={activeTab === 'akad' ? 'on' : ''}
                onClick={(e) => handleTabClick('akad', e.currentTarget)}
              >
                Ijab Qobul
              </button>
              <button
                className={activeTab === 'resepsi' ? 'on' : ''}
                onClick={(e) => handleTabClick('resepsi', e.currentTarget)}
              >
                Panggih &amp; Resepsi
              </button>
            </div>

            <div className="kt-ev rv d2">
              {activeTab === 'akad' ? (
                <div>
                  <div className="kt-eyebrow" style={{ marginBottom: '8px' }}>
                    Upacara Janji Luhur
                  </div>
                  <h3>Ijab Qobul Pasrah Tinampi</h3>
                  <p>
                    {eventDateFormatted}
                    <span>Wanci enjang ingkang prayogi</span>
                  </p>
                  <p>{akadTime}</p>
                  <p>
                    {akadVenue}
                    <span>{city}</span>
                  </p>
                </div>
              ) : (
                <div>
                  <div className="kt-eyebrow" style={{ marginBottom: '8px' }}>
                    Pahargyan Adat Kebesaran
                  </div>
                  <h3>Panggih &amp; Pawiwahan Ageng</h3>
                  <p>
                    {eventDateFormatted}
                    <span>Gamelan laras madya ngiringi</span>
                  </p>
                  <p>{resepsiTime}</p>
                  <p>
                    {resepsiVenue}
                    <span>{city}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="kt-row rv d3">
              <a className="kt-btn ghost" href={calUrl} target="_blank" rel="noopener noreferrer">
                Simpan ke Kalender
              </a>
              {mapsUrl && (
                <a className="kt-btn" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  Lokasi
                </a>
              )}
            </div>

            {/* Reroncen Adat Timeline */}
            <div className="kt-tl">
              <div className="rv">
                <h4>Siraman &amp; Cethik Geni</h4>
                <p className="kt-sans">Pembersihan raga lan jiwa lumantar toya suci pitu sumber.</p>
              </div>
              <div className="rv">
                <h4>Midodareni</h4>
                <p className="kt-sans">Wengi anggun wanci tumuruning widadari.</p>
              </div>
              <div className="rv">
                <h4>Ijab Qobul Suci</h4>
                <p className="kt-sans">Ikrar janji ing ngarsanipun Gusti, kaseksen para pinisepuh.</p>
              </div>
              <div className="rv">
                <h4>Upacara Panggih</h4>
                <p className="kt-sans">Balangan gantal, ngidak endhog, sinduran, kacar-kucur, sungkeman.</p>
              </div>
            </div>
          </section>

          {/* SECTION 5: GALLERY */}
          <section data-scene="gallery">
            <div className="kt-eyebrow rv">Dokumentasi Asmara</div>
            <h2 className="rv d1">
              Titian <em>Katresnan</em>
            </h2>
            <div className="kt-gal">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="kt-g rv zoom"
                  style={{ backgroundImage: `url(${img})` }}
                  onClick={() => setLbIndex(i)}
                />
              ))}
            </div>
          </section>

          {/* SECTION 6: GIFT */}
          <section data-scene="gift">
            <div className="kt-eyebrow rv">Kado &amp; Kecer Kencana</div>
            <h2 className="rv d1">
              Tanda <em>Tresna</em>
            </h2>
            <p className="kt-sans rv d2">Kagem para kadang ingkang kepareng ngaturaken kado asih:</p>

            <div className="kt-acc rv d2">
              <small>{bankName}</small>
              <b>{accountNumber}</b>
              <span className="kt-sans">
                a.n. <span>{accountHolder}</span>
              </span>
              <br />
              <button className="kt-btn ghost" style={{ marginTop: '12px' }} onClick={() => handleCopy(accountNumber)}>
                Salin Rekening
              </button>
            </div>

            {secondaryAccountNumber && (
              <div className="kt-acc rv d2" style={{ marginTop: '14px' }}>
                <small>{secondaryBankName}</small>
                <b>{secondaryAccountNumber}</b>
                <span className="kt-sans">
                  a.n. <span>{secondaryAccountHolder}</span>
                </span>
                <br />
                <button
                  className="kt-btn ghost"
                  style={{ marginTop: '12px' }}
                  onClick={() => handleCopy(secondaryAccountNumber)}
                >
                  Salin Rekening
                </button>
              </div>
            )}
          </section>

          {/* SECTION 7: RSVP & SESANTI */}
          <section data-scene="rsvp" className="hasbg">
            <div className="kt-sticky-bg">
              <div className="kt-pbg" style={{ backgroundImage: `url(${spotlightImage})` }} />
            </div>
            <div className="kt-eyebrow rv">Konfirmasi Rawuh</div>
            <h2 className="rv d1">
              Sesanti <em>Restu</em>
            </h2>
            <form className="kt-form rv d2" onSubmit={handleRsvpSubmit}>
              <div>
                <label>Nama Lengkap *</label>
                <input
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Bapak/Ibu/Sdr..."
                />
              </div>
              <div>
                <label>Kepareng Rawuh?</label>
                <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as any)}>
                  <option value="hadir">Inggih, Insya Allah Rawuh</option>
                  <option value="no">Mboten Saged</option>
                  <option value="mb">Dereng Tamtu</option>
                </select>
              </div>
              <div>
                <label>Pesan Doa</label>
                <textarea
                  rows={3}
                  value={rsvpMsg}
                  onChange={(e) => setRsvpMsg(e.target.value)}
                  placeholder="Donga restu panjenengan..."
                />
              </div>
              <button className="kt-btn" type="submit">
                Kirim Sesanti
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              {wishes.map((w, idx) => (
                <div key={idx} className="kt-wish">
                  <header>
                    <span>{w.n}</span>
                    <i className={w.s === 'hadir' ? '' : w.s}>
                      {w.s === 'hadir' ? 'Rawuh' : w.s === 'no' ? 'Mboten Saged' : 'Ragu'}
                    </i>
                  </header>
                  <p>&ldquo;{w.m}&rdquo;</p>
                  <span className="kt-sans" style={{ fontSize: '11px' }}>
                    {w.t}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 8: CLOSING */}
          <footer data-scene="close" style={{ padding: '80px 26px 110px', textAlign: 'center', background: '#0D0B0A' }}>
            <div className="kt-seal">
              {brideName.charAt(0)}&amp;{groomName.charAt(0)}
            </div>
            <h2 className="rv">
              Matur <em>Nuwun</em>
            </h2>
            <p className="kt-sans rv d1">
              Mugi Gusti Kang Akarya Jagad tansah paring berkah lan karaharjan dumateng panjenengan sedaya.
            </p>
            <div className="kt-rule" />
            <p className="kt-sans">
              Keluarga Ageng <span>{brideName}</span> &amp; <span>{groomName}</span>
            </p>
          </footer>
        </main>

        {/* RIGHT STAGE: DESKTOP ORNAMENTAL ART & SCENERY */}
        <aside className="kt-stage" aria-hidden="true">
          <div className="kt-stage-ui">Seri No. 14 · Royal Kraton</div>

          {SCENES.map((s) => (
            <div
              key={s.k}
              className={`kt-scene ${currentScene === s.k ? 'on' : ''}`}
            >
              <div className="kt-scene-bg-wrap">
                <img src={s.img} alt={s.t} className="kt-scene-img" />
                <div className="kt-scene-overlay" />
              </div>
              <div className="kt-cap">
                <small>{s.c}</small>
                <h3>{s.t}</h3>
              </div>
            </div>
          ))}

          <div className="kt-prog">
            {SCENES.map((s, i) => (
              <span key={s.k} className={currentScene === s.k ? 'on' : ''}>
                {String(i + 1).padStart(2, '0')}
              </span>
            ))}
          </div>
        </aside>
      </div>

      {/* Floating Audio Controller */}
      {isOpen && (
        <button
          className={`kt-music on ${isPlaying ? 'play' : ''}`}
          onClick={toggleAudio}
          aria-label="Musik"
        >
          {isPlaying ? '♪' : '∅'}
        </button>
      )}

      {/* Lightbox Modal */}
      {lbIndex !== null && (
        <div className="kt-lb on" onClick={() => setLbIndex(null)}>
          <button
            style={{ top: '20px', right: '20px' }}
            onClick={(e) => {
              e.stopPropagation();
              setLbIndex(null);
            }}
          >
            ×
          </button>
          <button
            style={{ left: '16px' }}
            onClick={(e) => {
              e.stopPropagation();
              setLbIndex((lbIndex + galleryImages.length - 1) % galleryImages.length);
            }}
          >
            ‹
          </button>
          <div
            className="kt-big"
            style={{ backgroundImage: `url(${galleryImages[lbIndex]})` }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{ right: '16px' }}
            onClick={(e) => {
              e.stopPropagation();
              setLbIndex((lbIndex + 1) % galleryImages.length);
            }}
          >
            ›
          </button>
        </div>
      )}

      {/* Toast Alert */}
      <div className={`kt-toast ${toastText ? 'on' : ''}`}>{toastText}</div>

      {/* Canvas Gold Dust */}
      <canvas ref={canvasRef} id="kt-dust" />
    </div>
  );
};
