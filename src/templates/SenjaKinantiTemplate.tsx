import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ClientInvitationData } from '../types/clientInvitation';
import { TEMPLATE_REGISTRY } from '../admin/templateRegistry';

interface SenjaKinantiTemplateProps {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

interface WishItem {
  n: string;
  m: string;
  t: string;
}

export const SenjaKinantiTemplate: React.FC<SenjaKinantiTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
}) => {
  const defaultMeta = TEMPLATE_REGISTRY['senja-kinanti']?.defaultData;

  // Resolve data
  const brideName = customData?.brideName || defaultMeta?.brideName || 'Kinanti';
  const groomName = customData?.groomName || defaultMeta?.groomName || 'Bagas';
  const brideFullName = customData?.brideFullName || defaultMeta?.brideFullName || 'Kinanti Sekar Arum, S.Ars.';
  const groomFullName = customData?.groomFullName || defaultMeta?.groomFullName || 'Bagas Dananjaya, M.Sc.';
  const brideParents = customData?.brideParents || defaultMeta?.brideParents || 'Putri pertama dari Bapak Ir. Bambang Soediro & Ibu Ratih Kumala';
  const groomParents = customData?.groomParents || defaultMeta?.groomParents || 'Putra kedua dari Bapak Dr. H. Gunawan Wibisono & Ibu Siti Rahayu';

  const eventDateFormatted = customData?.eventDateFormatted || defaultMeta?.eventDateFormatted || 'Minggu, 20 Desember 2026';
  const countdownIso = customData?.countdownIsoDate || defaultMeta?.countdownIsoDate || '2026-12-20T08:00:00+07:00';

  const akadTime = customData?.akadTime || defaultMeta?.akadTime || '08.00 – 10.00 WIB';
  const akadVenue = customData?.akadVenue || defaultMeta?.akadVenue || 'Plataran Dharmawangsa, Jl. Dharmawangsa Raya No. 6';
  const resepsiTime = customData?.resepsiTime || defaultMeta?.resepsiTime || '11.30 – 14.30 WIB';
  const resepsiVenue = customData?.resepsiVenue || defaultMeta?.resepsiVenue || 'Kinanti Sunset Garden Ballroom, Plataran Dharmawangsa';
  const city = customData?.city || defaultMeta?.city || 'Jakarta Selatan';
  const mapsUrl = customData?.mapsUrl || defaultMeta?.mapsUrl || 'https://maps.google.com';

  const quoteText = customData?.quoteText || defaultMeta?.quoteText || 'Maka luruhlah senja pada ketenangan pelukanmu. Cinta yang datang bukan sekadar singgah, melainkan takdir yang pulang ke rumah yang semestinya.';
  const quoteSource = customData?.quoteSource || defaultMeta?.quoteSource || 'Kidung Kinanti · 2026';

  const bankName = customData?.bankName || defaultMeta?.bankName || 'BANK MANDIRI';
  const accountNumber = customData?.accountNumber || defaultMeta?.accountNumber || '1370 0192 8472 1';
  const accountHolder = customData?.accountHolder || defaultMeta?.accountHolder || 'Kinanti Sekar Arum';

  const secondaryBankName = customData?.secondaryBankName || defaultMeta?.secondaryBankName || 'BANK BCA';
  const secondaryAccountNumber = customData?.secondaryAccountNumber || defaultMeta?.secondaryAccountNumber || '8271 9028 41';
  const secondaryAccountHolder = customData?.secondaryAccountHolder || defaultMeta?.secondaryAccountHolder || 'Bagas Dananjaya';

  const audioUrl = customData?.audioUrl || defaultMeta?.audioUrl || '';

  // Images
  const heroImage = customData?.mediaSlots?.heroImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=75';
  const spotlightImage = customData?.mediaSlots?.spotlightImage || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=75';
  const closingImage = customData?.mediaSlots?.closingImage || 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1400&q=75';
  const bridePortrait = customData?.mediaSlots?.bridePortrait || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=700&q=75';
  const groomPortrait = customData?.mediaSlots?.groomPortrait || 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=700&q=75';

  const rawGallery = customData?.mediaSlots?.galleryImages;
  const galleryImages: string[] = rawGallery && rawGallery.length > 0 ? rawGallery : [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=75',
    'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=800&q=75'
  ];

  // Guest name from URL
  const [guestName, setGuestName] = useState('Tamu Undangan Terhormat');
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
  const stageRef = useRef<HTMLElement | null>(null);
  const colRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const pctRef = useRef<HTMLSpanElement | null>(null);

  // Toast
  const [toastText, setToastText] = useState<string | null>(null);
  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2500);
  };

  // Lightbox
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  // RSVP Form & Wishes
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('Hadir');
  const [rsvpCount, setRsvpCount] = useState('2 orang');
  const [rsvpMsg, setRsvpMsg] = useState('');
  const [wishes, setWishes] = useState<WishItem[]>([
    { n: 'Dr. Hendra & Keluarga', m: 'Selamat menempuh babak baru. Semoga senantiasa rukun, berkah, dan penuh sakinah.', t: 'Kemarin' },
    { n: 'Arsita & Tim Studio', m: 'Happy wedding Kinan & Mas Bagas! Lancar sampai hari H yaa!', t: '2 hari lalu' },
    { n: 'Bima Wisesa', m: 'Selamat saudaraku! Bahagia selalu sampai kakek nenek.', t: '3 hari lalu' }
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

  // Canvas Petals
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<any[]>([]);
  const burstRef = useRef<(x: number, y: number) => void>(() => {});

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;

    let animId: number;
    let T = 0;
    const PC = ['#B85D38', '#D49A6A', '#F2B98A', '#FFE2C6'];

    const fit = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    fit();
    window.addEventListener('resize', fit);

    const petal = (x: number, y: number, b: boolean) => {
      const a = Math.random() * 6.28;
      const s = Math.random() * 6 + 2;
      return {
        x,
        y,
        s: Math.random() * 7 + 6,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.05,
        ph: Math.random() * 6.28,
        v: Math.random() * 0.7 + 0.5,
        c: PC[Math.floor(Math.random() * 4)],
        a: b ? 1 : Math.random() * 0.4 + 0.35,
        dx: b ? Math.cos(a) * s : 0,
        dy: b ? Math.sin(a) * s - 3 : 0,
        l: b ? 1 : 0
      };
    };

    const initial: any[] = [];
    for (let k = 0; k < 22; k++) {
      initial.push(petal(Math.random() * window.innerWidth, Math.random() * window.innerHeight, false));
    }
    petalsRef.current = initial;

    burstRef.current = (x: number, y: number) => {
      for (let i = 0; i < 40; i++) {
        petalsRef.current.push(petal(x, y, true));
      }
    };

    const loop = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      T += 0.02;
      petalsRef.current = petalsRef.current.filter((p) => {
        if (p.l) {
          p.x += p.dx;
          p.y += p.dy;
          p.dy += 0.12;
          p.dx *= 0.985;
          p.a -= 0.01;
          if (p.a <= 0) return false;
        } else {
          p.y += p.v;
          p.x += Math.sin(T + p.ph) * 0.7;
          if (p.y > cv.height + 20) {
            p.y = -20;
            p.x = Math.random() * cv.width;
          }
        }
        p.rot += p.vr;
        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate(p.rot);
        cx.scale(Math.cos(T * 1.5 + p.ph) * 0.5 + 0.6, 1);
        cx.globalAlpha = Math.max(0, p.a);
        cx.fillStyle = p.c;
        cx.beginPath();
        cx.moveTo(0, -p.s);
        cx.quadraticCurveTo(p.s * 0.8, -p.s * 0.2, 0, p.s);
        cx.quadraticCurveTo(-p.s * 0.8, -p.s * 0.2, 0, -p.s);
        cx.fill();
        cx.restore();
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

  // Open invitation handler
  const handleOpenCover = () => {
    setIsOpen(true);
    burstRef.current(window.innerWidth / 2, window.innerHeight * 0.45);
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

  // Stage Scene Definitions
  const SCENES = [
    { k: 'hero', t: 'Fajar Menyapa', c: 'Awal Cerita', img: heroImage },
    { k: 'quote', t: 'Luruh di Pelukan Senja', c: 'Sesanti', img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=75' },
    { k: 'couple', t: 'Dua Jiwa Bertaut', c: 'Mempelai', img: bridePortrait },
    { k: 'event', t: 'Janji di Jam Emas', c: 'Jadwal & Lokasi', img: spotlightImage },
    { k: 'gallery', t: 'Potret Kenangan', c: 'Galeri', img: galleryImages[2] || galleryImages[0] },
    { k: 'gift', t: 'Tanda Kasih', c: 'Kado Digital', img: 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=1400&q=75' },
    { k: 'rsvp', t: 'Doa di Kala Magrib', c: 'Konfirmasi', img: groomPortrait },
    { k: 'close', t: 'Selamat Malam, Cinta', c: 'Terima Kasih', img: closingImage }
  ];

  // Stage Sunset Color Interpolation
  const ST_COLORS = [
    [0, [255, 217, 160], [240, 150, 90], [74, 40, 40], [30, 16, 16]],
    [0.35, [255, 170, 90], [232, 110, 64], [60, 30, 34], [26, 12, 16]],
    [0.65, [226, 90, 110], [170, 56, 92], [44, 22, 40], [20, 10, 18]],
    [1, [110, 70, 170], [60, 40, 110], [20, 14, 36], [8, 6, 18]]
  ];

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const mixColor = (p: number, x: number) => {
    for (let i = 1; i < ST_COLORS.length; i++) {
      if (p <= (ST_COLORS[i][0] as number)) {
        const a = ST_COLORS[i - 1];
        const b = ST_COLORS[i];
        const t = (p - (a[0] as number)) / ((b[0] as number) - (a[0] as number));
        const arrA = a[x] as number[];
        const arrB = b[x] as number[];
        return arrA.map((v, j) => Math.round(lerp(v, arrB[j], t)));
      }
    }
    const last = ST_COLORS[ST_COLORS.length - 1];
    return last[x] as number[];
  };

  const paintGlow = (p: number) => {
    if (!stageRef.current) return;
    const s = stageRef.current.style;
    const r = (a: number[]) => `rgb(${a.join(',')})`;
    s.setProperty('--gy', `${(36 + 76 * Math.pow(p, 1.4)).toFixed(1)}%`);
    s.setProperty('--c1', r(mixColor(p, 1)));
    s.setProperty('--c2', r(mixColor(p, 2)));
    s.setProperty('--sk1', r(mixColor(p, 3)));
    s.setProperty('--sk2', r(mixColor(p, 4)));
  };

  // Scroll tracking on .col
  const handleColScroll = () => {
    const col = colRef.current;
    if (!col) return;
    const max = col.scrollHeight - col.clientHeight;
    const p = max > 0 ? Math.max(0, Math.min(1, col.scrollTop / max)) : 0;
    paintGlow(p);
    if (barRef.current) {
      barRef.current.style.width = `${p * 100}%`;
    }
  };

  // Intersection Observer for scenes and reveal elements
  useEffect(() => {
    const col = colRef.current;
    if (!col) return;

    // Observe scene sections
    const sceneEls = col.querySelectorAll<HTMLElement>('[data-scene]');
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.35) {
            const sc = (e.target as HTMLElement).dataset.scene;
            if (sc) {
              setCurrentScene(sc);
              const idx = SCENES.findIndex((s) => s.k === sc);
              if (pctRef.current && idx >= 0) {
                pctRef.current.textContent = `${String(idx + 1).padStart(2, '0')} / 0${SCENES.length}`;
              }
            }
          }
        });
      },
      { root: col, threshold: [0.35, 0.6] }
    );
    sceneEls.forEach((el) => so.observe(el));

    // Observe reveal elements
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

    return () => {
      so.disconnect();
      ro.disconnect();
    };
  }, [isOpen]);

  // Tab pill position update
  const handleTabClick = (tab: 'akad' | 'resepsi', btnEl: HTMLButtonElement) => {
    setActiveTab(tab);
    if (pillRef.current) {
      pillRef.current.style.left = `${btnEl.offsetLeft}px`;
      pillRef.current.style.width = `${btnEl.offsetWidth}px`;
    }
  };

  // Clipboard copy
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
      m: rsvpMsg.trim() || 'Selamat menempuh hidup baru, semoga bahagia selalu.',
      t: 'Baru saja'
    };
    setWishes([newWish, ...wishes]);
    setRsvpName('');
    setRsvpMsg('');
    showToast('Konfirmasi & doa Anda terkirim');
    burstRef.current(window.innerWidth / 2, window.innerHeight * 0.6);
  };

  // Google Calendar
  const calDates = '20261220T010000Z/20261220T073000Z';
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Pernikahan ${brideName} & ${groomName}`
  )}&location=${encodeURIComponent(akadVenue)}&dates=${calDates}`;

  return (
    <div className="senja-kinanti-root">
      {/* Stylesheet matching prototype Senja Kinanti exactly */}
      <style>{`
        .senja-kinanti-root {
          --cream: #FDFBF7;
          --sand: #F7F1E8;
          --paper: #fff;
          --line: #E8DACB;
          --ink: #241F1C;
          --mute: #716155;
          --terra: #B85D38;
          --amber: #D49A6A;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans: 'Jost', system-ui, sans-serif;
          position: fixed;
          inset: 0;
          background: #12100E;
          color: var(--ink);
          font-family: var(--serif);
          overflow: hidden;
          z-index: 50;
        }

        .senja-kinanti-root *,
        .senja-kinanti-root *::before,
        .senja-kinanti-root *::after {
          box-sizing: border-box;
          margin: 0;
        }

        .sk-app {
          display: grid;
          grid-template-columns: 1fr;
          height: 100%;
        }

        .sk-col {
          position: relative;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: smooth;
          background: var(--cream);
          scrollbar-width: none;
        }
        .sk-col::-webkit-scrollbar { display: none; }

        .sk-stage {
          display: none;
          position: relative;
          overflow: hidden;
          background: #140a0c;
        }

        @media(min-width: 1024px) {
          .sk-app {
            grid-template-columns: minmax(420px, 480px) 1fr;
          }
          .sk-col {
            order: 1;
            box-shadow: 24px 0 70px rgba(0,0,0,0.45);
            z-index: 2;
          }
          .sk-stage {
            display: block;
            order: 2;
          }
        }

        /* STAGE: Langit Senja Berubah Dinamis */
        .sk-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(60% 7% at 50% var(--gy, 38%), var(--c1, #ffd9a0), transparent 70%),
                      radial-gradient(75% 40% at 50% var(--gy, 38%), var(--c1, #ffd9a0), transparent 72%),
                      radial-gradient(130% 80% at 50% calc(var(--gy, 38%) + 14%), var(--c2, #f0965a), transparent 78%),
                      linear-gradient(var(--sk1, #4a2828), var(--sk2, #1e1010));
          transition: background 0.1s linear;
        }

        .sk-sky {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0;
          transition: opacity 1.6s ease;
        }
        .sk-sky::before, .sk-sky::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .sk-sky::before {
          mix-blend-mode: soft-light;
          background: radial-gradient(110% 55% at 50% var(--gy, 40%), var(--c1, #ffd9a0), transparent 72%),
                      linear-gradient(to top, var(--c2, #f0965a), transparent 60%);
        }
        .sk-sky::after {
          background: linear-gradient(rgba(20,10,8,0.4), transparent 30%, transparent 55%, rgba(20,10,8,0.6));
        }
        .sk-sky.on {
          opacity: 1;
        }
        .sk-sky img {
          position: absolute;
          left: -5%;
          top: -5%;
          width: 110%;
          height: 110%;
          object-fit: cover;
          animation: sk-ken 24s ease-in-out infinite alternate;
        }
        @keyframes sk-ken {
          to { transform: scale(1.08) translate(-1.5%, 1%); }
        }

        .sk-cap {
          position: absolute;
          left: 0;
          right: 0;
          top: 9%;
          z-index: 5;
          text-align: center;
          color: #fff7ea;
          text-shadow: 0 2px 20px rgba(0,0,0,0.35);
        }
        .sk-cap > div {
          position: absolute;
          left: 0;
          right: 0;
          opacity: 0;
          transform: translateY(18px);
          transition: all 1s;
        }
        .sk-cap > div.on {
          opacity: 1;
          transform: none;
          transition-delay: 0.4s;
        }
        .sk-cap small {
          font: 500 11px var(--sans);
          letter-spacing: 0.4em;
          text-transform: uppercase;
          opacity: 0.85;
          display: block;
        }
        .sk-cap h3 {
          font-weight: 400;
          font-style: italic;
          font-size: clamp(30px, 3.6vw, 56px);
          margin-top: 6px;
        }

        .sk-ui {
          position: absolute;
          z-index: 6;
          bottom: 22px;
          left: 26px;
          right: 26px;
          display: flex;
          justify-content: space-between;
          font: 500 10px var(--sans);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #fff7ea;
          opacity: 0.8;
        }
        .sk-bar {
          position: absolute;
          z-index: 6;
          left: 0;
          bottom: 0;
          height: 3px;
          background: #ffd9a0;
          width: 0%;
          transition: width 0.1s linear;
        }

        /* COVER GATE */
        .sk-cover {
          position: fixed;
          inset: 0;
          z-index: 100;
          overflow: hidden;
          color: #fff7ea;
          text-align: center;
          background: linear-gradient(180deg, #f7d09a 0%, #e58a5c 38%, #8c3d3a 70%, #2a1519 100%);
          transition: transform 1.5s cubic-bezier(0.7, 0, 0.2, 1);
        }
        .sk-cover.open {
          transform: translateY(-100%);
          pointer-events: none;
        }
        .sk-csun {
          position: absolute;
          left: 50%;
          top: 44%;
          width: min(46vw, 230px);
          aspect-ratio: 1;
          margin-left: calc(min(46vw, 230px) / -2);
          border-radius: 50%;
          background: radial-gradient(circle, #fff6dc, #ffc27a 55%, #e9784a);
          box-shadow: 0 0 120px 60px rgba(255,190,120,0.5);
          animation: sk-rise 3.2s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        @keyframes sk-rise {
          from { transform: translateY(45vh); opacity: 0; }
        }
        .sk-cover .sk-hl {
          position: absolute;
          left: -2%;
          right: -2%;
          bottom: 0;
          height: 46%;
        }
        .sk-cover .sk-hl svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .sk-cin {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 7vh 24px 6vh;
        }
        .sk-a {
          opacity: 0;
          transform: translateY(22px);
          animation: sk-gin 1s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          animation-delay: calc(var(--d, 0) * 1s);
        }
        @keyframes sk-gin {
          to { opacity: 1; transform: none; }
        }
        .sk-cover.open .sk-a {
          animation: sk-gout 0.5s forwards;
        }
        @keyframes sk-gout {
          to { opacity: 0; }
        }
        .sk-lab {
          font: 500 11px var(--sans);
          letter-spacing: 0.38em;
          text-transform: uppercase;
        }
        .sk-cn {
          font-size: min(15vw, 10vh, 76px);
          font-weight: 400;
          line-height: 0.95;
          margin: 10px 0;
        }
        .sk-cn i {
          display: block;
          font-size: 0.45em;
          color: #ffe2b8;
          margin: 2px 0;
        }
        .sk-gbox {
          margin-top: 18px;
          padding: 12px 22px;
          border-radius: 18px;
          background: rgba(30,15,14,0.35);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,226,184,0.35);
        }
        .sk-gbox small {
          display: block;
          font: 300 10px var(--sans);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .sk-gbox b {
          font: 600 20px var(--serif);
        }
        .sk-go {
          position: relative;
          overflow: hidden;
          font: 600 11px var(--sans);
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #fff7ea;
          border: 0;
          border-radius: 99px;
          padding: 16px 34px;
          cursor: pointer;
          background: linear-gradient(90deg, #B85D38, #D49A6A);
          box-shadow: 0 10px 40px rgba(184,93,56,0.5);
          transition: transform 0.3s;
        }
        .sk-go:hover {
          transform: translateY(-3px) scale(1.04);
        }
        .sk-go::after {
          content: "";
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: rgba(255,255,255,0.4);
          transform: skewX(-20deg);
          animation: sk-sh 3s infinite;
        }
        @keyframes sk-sh {
          to { left: 130%; }
        }

        /* SECTIONS */
        .sk-col section {
          position: relative;
          padding: 84px 26px;
          text-align: center;
          border-bottom: 1px solid var(--line);
        }
        .sk-col section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 0;
          height: 1px;
          z-index: 2;
          background: linear-gradient(90deg, transparent, var(--amber), transparent);
          transition: width 1.4s 0.1s, left 1.4s 0.1s;
        }
        .sk-col section.in::before {
          width: 100%;
          left: 0;
        }
        .sk-col section > * {
          position: relative;
          z-index: 1;
        }
        .sk-col section.hasbg {
          overflow: hidden;
          color: #fff7ea;
          border-color: transparent;
        }
        .sk-pbg {
          position: absolute !important;
          inset: -10%;
          z-index: 0 !important;
          background-size: cover;
          background-position: center;
          background-color: #7a3b3b;
        }
        .sk-pbg::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(30,18,14,0.4), rgba(30,18,14,0.6));
        }
        .sk-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .sk-eb {
          font: 600 10px var(--sans);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--terra);
        }
        .hasbg .sk-eb {
          color: #ffd9a8;
        }
        .sk-col h2 {
          font-weight: 400;
          font-size: 34px;
          line-height: 1.15;
          margin: 8px 0 14px;
        }
        .sk-col h2 em {
          color: var(--terra);
          font-style: italic;
        }
        .hasbg .sk-col h2 em {
          color: #ffd9a8;
        }
        .sk-nm {
          font-weight: 400;
          font-size: clamp(48px, 14vw, 68px);
          line-height: 0.95;
          margin: 14px 0;
        }
        .sk-nm i {
          display: block;
          font-size: 0.4em;
          color: #ffd9a8;
          margin: 4px 0;
        }
        .sk-sans {
          font: 300 13px/1.7 var(--sans);
          color: var(--mute);
        }
        .hasbg .sk-sans {
          color: #f3dcc6;
        }
        .sk-dt {
          font: 500 12px var(--sans);
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
        .sk-rule {
          width: 80px;
          height: 1px;
          margin: 16px auto;
          background: linear-gradient(90deg, transparent, var(--amber), transparent);
        }

        /* REVEAL ANIMATIONS */
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

        /* COUNTDOWN */
        .sk-cd {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 28px;
          width: 100%;
          max-width: 330px;
        }
        .sk-cd div {
          padding: 12px 0;
          border-radius: 16px;
          background: rgba(255,247,234,0.14);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,226,184,0.35);
        }
        .sk-cd b {
          display: block;
          font: 600 28px var(--serif);
          font-variant-numeric: tabular-nums;
        }
        .sk-cd small {
          font: 400 9px var(--sans);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.85;
        }

        /* COUPLE & CARDS */
        .sk-card {
          padding: 26px 22px;
          border-radius: 24px;
          background: var(--sand);
          border: 1px solid var(--line);
        }
        .sk-quote {
          font-size: 20px;
          font-style: italic;
          line-height: 1.6;
        }
        .sk-pair {
          display: grid;
          gap: 22px;
          margin-top: 26px;
        }
        .sk-pf {
          width: 176px;
          height: 224px;
          margin: 0 auto 14px;
          border-radius: 88px 88px 16px 16px;
          overflow: hidden;
          border: 2px solid var(--amber);
          position: relative;
        }
        .sk-pf .sk-ph {
          width: 100%;
          height: 100%;
          background: linear-gradient(160deg, #f2b98a, #b85d38);
          background-size: cover;
          background-position: center;
          transition: transform 1.6s;
        }
        .sk-person h3 {
          font-weight: 400;
          font-size: 24px;
        }
        .sk-person em {
          display: block;
          color: var(--terra);
          margin: 2px 0 8px;
        }
        .sk-person a {
          color: var(--terra);
          font: 400 12px var(--sans);
          text-decoration: none;
        }

        /* EVENT TABS */
        .sk-tabs {
          display: inline-flex;
          padding: 4px;
          border-radius: 99px;
          margin: 8px 0 20px;
          position: relative;
          background: rgba(20,10,8,0.45);
          backdrop-filter: blur(8px);
        }
        .sk-tabs button {
          position: relative;
          z-index: 1;
          font: 600 10px var(--sans);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 11px 20px;
          border: 0;
          background: none;
          color: #f3dcc6;
          cursor: pointer;
          transition: color 0.4s;
        }
        .sk-tabs button.on {
          color: #fff;
        }
        .sk-pill {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 4px;
          border-radius: 99px;
          background: linear-gradient(90deg, #B85D38, #D49A6A);
          transition: all 0.45s cubic-bezier(0.6, 0, 0.2, 1);
        }
        .sk-ev {
          padding: 26px 22px;
          border-radius: 24px;
          background: rgba(20,10,8,0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,217,168,0.35);
          text-align: left;
          min-height: 200px;
        }
        .sk-ev h3 {
          font-weight: 400;
          font-size: 26px;
          margin: 6px 0 12px;
          color: #ffe2b8;
        }
        .sk-ev p {
          font: 400 13px/1.5 var(--sans);
          margin-bottom: 10px;
        }
        .sk-ev p span {
          display: block;
          font-weight: 300;
          opacity: 0.75;
        }
        .sk-row {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .sk-btn {
          flex: 1;
          min-width: 140px;
          text-align: center;
          text-decoration: none;
          font: 600 10px var(--sans);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 14px 10px;
          border-radius: 99px;
          border: 1px solid rgba(255,217,168,0.5);
          color: #fff7ea;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
        }
        .sk-btn.fill {
          background: linear-gradient(90deg, #B85D38, #D49A6A);
          border-color: transparent;
          color: #fff;
        }
        .sk-btn:hover {
          transform: translateY(-2px);
        }

        /* GALLERY */
        .sk-gal {
          columns: 2;
          gap: 10px;
          margin-top: 22px;
        }
        .sk-g {
          break-inside: avoid;
          margin-bottom: 10px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--line);
          background-size: cover;
          background-position: center;
          cursor: pointer;
          display: grid;
          place-items: center;
          color: #fff7ea;
          font-size: 28px;
          transition: transform 0.5s;
        }
        .sk-g:hover {
          transform: scale(1.03);
        }

        /* LIGHTBOX */
        .sk-lb {
          position: fixed;
          inset: 0;
          z-index: 110;
          background: rgba(10,6,5,0.94);
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .sk-lb.on {
          display: flex;
        }
        .sk-big {
          width: min(88vw, 520px);
          aspect-ratio: 3/4;
          border-radius: 18px;
          background-size: cover;
          background-position: center;
        }
        .sk-lb button {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 0;
          background: rgba(255,255,255,0.14);
          color: #fff;
          font-size: 22px;
          cursor: pointer;
        }

        /* DIGITAL GIFT */
        .sk-acc {
          padding: 18px;
          border-radius: 18px;
          background: var(--paper);
          border: 1px solid var(--line);
          text-align: left;
          margin-top: 14px;
        }
        .sk-acc small {
          font: 600 10px var(--sans);
          letter-spacing: 0.25em;
          color: var(--terra);
        }
        .sk-acc b {
          display: block;
          font: 600 20px ui-monospace, Menlo, monospace;
          margin: 6px 0 2px;
        }
        .sk-cp {
          margin-top: 12px;
          width: 100%;
          padding: 11px;
          border-radius: 12px;
          border: 0;
          background: var(--sand);
          color: var(--terra);
          font: 600 11px var(--sans);
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: background 0.3s;
        }
        .sk-cp:hover {
          background: var(--line);
        }

        /* RSVP */
        .sk-form {
          display: grid;
          gap: 12px;
          text-align: left;
          margin-top: 22px;
        }
        .sk-form label {
          font: 600 10px var(--sans);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--terra);
        }
        .sk-form input, .sk-form select, .sk-form textarea {
          width: 100%;
          margin-top: 5px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: var(--paper);
          color: var(--ink);
          font: 400 13px var(--sans);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .sk-form input:focus, .sk-form select:focus, .sk-form textarea:focus {
          outline: 0;
          border-color: var(--terra);
          box-shadow: 0 0 0 3px rgba(184,93,56,0.15);
        }
        .sk-wish {
          padding: 14px 16px;
          border-radius: 16px;
          background: var(--sand);
          border: 1px solid var(--line);
          text-align: left;
          margin-top: 10px;
        }
        .sk-wish header {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font: 600 12px var(--sans);
        }
        .sk-wish i {
          font: 400 10px var(--sans);
          color: var(--mute);
          font-style: normal;
          white-space: nowrap;
        }
        .sk-wish p {
          font: 300 13px/1.5 var(--sans);
          color: var(--mute);
          margin-top: 4px;
        }

        /* CLOSING MONOGRAM */
        .sk-mono {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin: 0 auto 16px;
          border: 1px solid #ffd9a8;
          display: grid;
          place-items: center;
          font-size: 22px;
          color: #ffe2b8;
          position: relative;
        }
        .sk-mono::after {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1px dashed #ffd9a8;
          opacity: 0.6;
          animation: sk-sp 18s linear infinite;
        }
        @keyframes sk-sp {
          to { transform: rotate(360deg); }
        }

        /* FLOATING MUSIC */
        .sk-music {
          position: fixed;
          z-index: 60;
          right: 16px;
          bottom: 20px;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid var(--amber);
          background: rgba(36,31,28,0.88);
          color: #ffd9a8;
          cursor: pointer;
          display: grid;
          place-items: center;
          font-size: 18px;
        }
        .sk-music.play {
          animation: sk-sp 6s linear infinite;
        }
        @media(min-width: 1024px) {
          .sk-music {
            right: auto;
            left: calc(min(480px, 100vw) - 62px);
          }
        }

        /* TOAST */
        .sk-toast {
          position: fixed;
          left: 50%;
          bottom: 90px;
          transform: translate(-50%, 20px);
          z-index: 120;
          padding: 10px 20px;
          border-radius: 99px;
          background: #241F1C;
          color: #fff7ea;
          font: 500 12px var(--sans);
          opacity: 0;
          transition: all 0.4s;
          pointer-events: none;
          border: 1px solid var(--amber);
        }
        .sk-toast.on {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        #sk-dust {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 130;
        }
      `}</style>

      {/* Background Audio */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop preload="none" />}

      {/* Top Bar for Catalog / Order CTA */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#12100E]/90 backdrop-blur-md border-b border-[#D49A6A]/30 px-4 py-2 flex items-center justify-between text-xs font-sans">
        {onBackToLanding ? (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-[#FFE2B8] hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </button>
        ) : (
          <span className="text-[#FFE2B8] tracking-widest uppercase text-[10px]">Atelier Sekarsiti</span>
        )}
        <span className="text-[11px] uppercase tracking-widest text-[#D49A6A] font-semibold">
          Seri No. 13 · Senja Kinanti
        </span>
        {onOrderViaWhatsApp && (
          <button
            onClick={onOrderViaWhatsApp}
            className="bg-gradient-to-r from-[#B85D38] to-[#D49A6A] text-white px-3 py-1 rounded-full text-[11px] font-semibold hover:brightness-110 transition cursor-pointer"
          >
            Pesan Desain Ini
          </button>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 1. COVER GATE */}
      {/* ========================================================================= */}
      <div className={`sk-cover ${isOpen ? 'open' : ''}`}>
        <div className="sk-csun"></div>
        <div className="sk-hl">
          <svg viewBox="0 0 800 300" preserveAspectRatio="none">
            <path d="M0 170 Q150 80 300 140 T600 120 T800 150 V300H0Z" fill="#6b2e32" />
            <path d="M0 225 Q200 140 400 205 T800 185 V300H0Z" fill="#2b1519" />
          </svg>
        </div>
        <div className="sk-cin">
          <div className="sk-a sk-lab" style={{ ['--d' as any]: 0.3 }}>
            Undangan Pernikahan
          </div>
          <div>
            <div className="sk-a sk-lab" style={{ ['--d' as any]: 0.7, opacity: 0.85 }}>
              The Wedding Of
            </div>
            <h1 className="sk-a sk-cn" style={{ ['--d' as any]: 1 }}>
              <span>{brideName}</span>
              <i>&amp;</i>
              <span>{groomName}</span>
            </h1>
            <div className="sk-a sk-dt" style={{ ['--d' as any]: 1.3 }}>
              {eventDateFormatted}
            </div>
            <div className="sk-a sk-gbox" style={{ ['--d' as any]: 1.5 }}>
              <small>Kepada Yth.</small>
              <b>{guestName}</b>
            </div>
          </div>
          <button className="sk-a sk-go" style={{ ['--d' as any]: 1.8 }} onClick={handleOpenCover}>
            Buka Undangan
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN APP: 2 COLUMNS (LEFT MOBILE SCROLL + RIGHT DESKTOP STAGE) */}
      {/* ========================================================================= */}
      <div className="sk-app pt-10">
        {/* LEFT COLUMN: SCROLLABLE INVITATION CONTENT */}
        <main className="sk-col" ref={colRef} onScroll={handleColScroll}>
          {/* SECTION 1: HERO */}
          <section className="sk-hero hasbg" data-scene="hero">
            <div className="sk-pbg" style={{ backgroundImage: `url(${heroImage})` }} />
            <div className="sk-eb rv">Ikrar Kasih di Kala Senja</div>
            <h1 className="sk-nm rv d1">
              <span>{brideName}</span>
              <i>&amp;</i>
              <span>{groomName}</span>
            </h1>
            <div className="sk-rule rv d2" />
            <div className="sk-dt rv d2">{eventDateFormatted}</div>
            <p className="sk-sans rv d3">{city}</p>
            <div className="sk-cd rv d3">
              <div>
                <b>{timeLeft.d}</b>
                <small>Hari</small>
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
          </section>

          {/* SECTION 2: QUOTE */}
          <section data-scene="quote">
            <div className="sk-eb rv">Bismillahirrahmanirrahim</div>
            <h2 className="rv d1">
              Maka luruhlah <em>senja</em>
            </h2>
            <div className="sk-card rv d2">
              <p className="sk-quote">&ldquo;{quoteText}&rdquo;</p>
              <div className="sk-rule" />
              <p className="sk-sans">{quoteSource}</p>
            </div>
          </section>

          {/* SECTION 3: COUPLE */}
          <section data-scene="couple">
            <div className="sk-eb rv">Dua Jiwa Bertaut</div>
            <h2 className="rv d1">
              Mempelai yang <em>Berbahagia</em>
            </h2>
            <p className="sk-sans rv d2">
              Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud melangsungkan pernikahan putra-putri kami:
            </p>
            <div className="sk-pair">
              {/* Mempelai Wanita */}
              <div className="sk-person sk-card rv l">
                <div className="sk-pf">
                  <div className="sk-ph" style={{ backgroundImage: `url(${bridePortrait})` }} />
                </div>
                <h3>{brideFullName}</h3>
                <em>The Bride</em>
                <p className="sk-sans">{brideParents}</p>
              </div>

              {/* Mempelai Pria */}
              <div className="sk-person sk-card rv r">
                <div className="sk-pf">
                  <div className="sk-ph" style={{ backgroundImage: `url(${groomPortrait})` }} />
                </div>
                <h3>{groomFullName}</h3>
                <em>The Groom</em>
                <p className="sk-sans">{groomParents}</p>
              </div>
            </div>
          </section>

          {/* SECTION 4: EVENT & JADWAL */}
          <section className="hasbg" data-scene="event">
            <div className="sk-pbg" style={{ backgroundImage: `url(${spotlightImage})` }} />
            <div className="sk-eb rv">Jadwal &amp; Lokasi</div>
            <h2 className="rv d1">
              Rangkaian <em>Janji Suci</em>
            </h2>

            <div className="sk-tabs rv d2" ref={tabsRef}>
              <span className="sk-pill" ref={pillRef} style={{ left: activeTab === 'akad' ? '4px' : '50%' }} />
              <button
                className={activeTab === 'akad' ? 'on' : ''}
                onClick={(e) => handleTabClick('akad', e.currentTarget)}
              >
                Akad Nikah
              </button>
              <button
                className={activeTab === 'resepsi' ? 'on' : ''}
                onClick={(e) => handleTabClick('resepsi', e.currentTarget)}
              >
                Resepsi
              </button>
            </div>

            <div className="sk-ev rv zoom d2">
              {activeTab === 'akad' ? (
                <div>
                  <div className="sk-eb">Akad Nikah</div>
                  <h3>Ikrar Suci di Pagi Hari</h3>
                  <p>{eventDateFormatted}</p>
                  <p>{akadTime}</p>
                  <p>
                    {akadVenue}
                    <span>{city}</span>
                  </p>
                </div>
              ) : (
                <div>
                  <div className="sk-eb">Resepsi Pernikahan</div>
                  <h3>Perayaan di Jam Emas</h3>
                  <p>{eventDateFormatted}</p>
                  <p>{resepsiTime}</p>
                  <p>
                    {resepsiVenue}
                    <span>{city}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="sk-row rv d3">
              <a className="sk-btn" href={calUrl} target="_blank" rel="noopener noreferrer">
                Simpan ke Kalender
              </a>
              {mapsUrl && (
                <a className="sk-btn fill" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  Petunjuk Arah
                </a>
              )}
            </div>
          </section>

          {/* SECTION 5: GALLERY */}
          <section data-scene="gallery">
            <div className="sk-eb rv">Potret Kasih</div>
            <h2 className="rv d1">
              Galeri <em>Kenangan</em>
            </h2>
            <div className="sk-gal">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="sk-g rv zoom"
                  style={{
                    height: `${[240, 180, 210, 260, 190, 230][i % 6]}px`,
                    backgroundImage: `url(${img})`
                  }}
                  onClick={() => setLbIndex(i)}
                />
              ))}
            </div>
          </section>

          {/* SECTION 6: DIGITAL GIFT */}
          <section data-scene="gift">
            <div className="sk-eb rv">Tanda Kasih Digital</div>
            <h2 className="rv d1">
              Kado <em>Pernikahan</em>
            </h2>
            <p className="sk-sans rv d2">
              Doa restu Anda adalah kado terindah. Jika berkenan memberi tanda kasih, dapat melalui rekening berikut:
            </p>
            <div className="sk-acc rv zoom">
              <small>{bankName}</small>
              <b>{accountNumber}</b>
              <span className="sk-sans">{accountHolder}</span>
              <button className="sk-cp" onClick={() => handleCopy(accountNumber)}>
                Salin Nomor Rekening
              </button>
            </div>
            {secondaryAccountNumber && (
              <div className="sk-acc rv zoom d1">
                <small>{secondaryBankName}</small>
                <b>{secondaryAccountNumber}</b>
                <span className="sk-sans">{secondaryAccountHolder}</span>
                <button className="sk-cp" onClick={() => handleCopy(secondaryAccountNumber)}>
                  Salin Nomor Rekening
                </button>
              </div>
            )}
          </section>

          {/* SECTION 7: RSVP & WISHES */}
          <section data-scene="rsvp">
            <div className="sk-eb rv">Konfirmasi &amp; Doa</div>
            <h2 className="rv d1">
              Reservasi <em>Kehadiran</em>
            </h2>
            <form className="sk-form rv d2" onSubmit={handleRsvpSubmit}>
              <div>
                <label>Nama Anda / Keluarga *</label>
                <input
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Contoh: Bpk. Hendra &amp; Istri"
                />
              </div>
              <div>
                <label>Kehadiran</label>
                <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)}>
                  <option value="Hadir">Insya Allah Hadir</option>
                  <option value="Ragu">Masih Ragu</option>
                  <option value="Absen">Maaf, Tidak Dapat Hadir</option>
                </select>
              </div>
              {rsvpStatus === 'Hadir' && (
                <div>
                  <label>Jumlah Tamu</label>
                  <select value={rsvpCount} onChange={(e) => setRsvpCount(e.target.value)}>
                    <option>1 orang</option>
                    <option>2 orang</option>
                    <option>3 orang</option>
                    <option>4 orang atau lebih</option>
                  </select>
                </div>
              )}
              <div>
                <label>Ucapan &amp; Doa</label>
                <textarea
                  rows={3}
                  value={rsvpMsg}
                  onChange={(e) => setRsvpMsg(e.target.value)}
                  placeholder="Tuliskan doa tulus Anda..."
                />
              </div>
              <button className="sk-btn fill" type="submit" style={{ border: 0 }}>
                Kirim
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              {wishes.map((w, idx) => (
                <div key={idx} className="sk-wish">
                  <header>
                    <span>{w.n}</span>
                    <i>{w.t}</i>
                  </header>
                  <p>{w.m}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 8: CLOSING */}
          <section className="hasbg" data-scene="close" style={{ paddingBottom: '110px' }}>
            <div className="sk-pbg" style={{ backgroundImage: `url(${closingImage})` }} />
            <div className="sk-mono rv">
              {brideName.charAt(0)}&amp;{groomName.charAt(0)}
            </div>
            <h2 className="rv d1">
              Terima <em>Kasih</em>
            </h2>
            <p className="sk-sans rv d2">
              Atas doa restu dan kehadiran Anda yang amat berarti bagi awal langkah kebersamaan kami.
            </p>
            <div className="sk-rule rv d2" />
            <p className="rv d3" style={{ fontSize: '26px', fontStyle: 'italic' }}>
              <span>{brideName}</span> &amp; <span>{groomName}</span>
            </p>
          </section>
        </main>

        {/* RIGHT STAGE: DESKTOP ATMOSPHERIC STAGE */}
        <aside className="sk-stage" ref={stageRef} aria-hidden="true">
          <div className="sk-glow" />
          {SCENES.map((s) => (
            <div
              key={s.k}
              className={`sk-sky ${currentScene === s.k ? 'on' : ''}`}
              data-k={s.k}
            >
              <img src={s.img} alt="" />
            </div>
          ))}
          <div className="sk-cap">
            {SCENES.map((s) => (
              <div key={s.k} className={currentScene === s.k ? 'on' : ''}>
                <small>{s.c}</small>
                <h3>{s.t}</h3>
              </div>
            ))}
          </div>
          <div className="sk-ui">
            <span>Senja Kinanti</span>
            <span ref={pctRef}>01 / 08</span>
          </div>
          <div className="sk-bar" ref={barRef} />
        </aside>
      </div>

      {/* Floating Audio Controller */}
      {isOpen && (
        <button
          className={`sk-music on ${isPlaying ? 'play' : ''}`}
          onClick={toggleAudio}
          aria-label="Musik"
        >
          {isPlaying ? '♪' : '∅'}
        </button>
      )}

      {/* Lightbox Modal */}
      {lbIndex !== null && (
        <div className="sk-lb on" onClick={() => setLbIndex(null)}>
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
            style={{ left: '14px' }}
            onClick={(e) => {
              e.stopPropagation();
              setLbIndex((lbIndex + galleryImages.length - 1) % galleryImages.length);
            }}
          >
            ‹
          </button>
          <div
            className="sk-big"
            style={{ backgroundImage: `url(${galleryImages[lbIndex]})` }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{ right: '14px' }}
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
      <div className={`sk-toast ${toastText ? 'on' : ''}`}>{toastText}</div>

      {/* Canvas Flower Petals */}
      <canvas ref={canvasRef} id="sk-dust" />
    </div>
  );
};
