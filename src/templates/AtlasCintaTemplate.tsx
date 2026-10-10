import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Disc3, Disc, Copy, Check } from 'lucide-react';
import { ClientInvitationData } from '../types/clientInvitation';
import {
  useCountdown,
  useGuestRecipient,
  useAudioController,
  useClipboardCopy,
  useGuestbook
} from '../hooks/useInvitationCore';
import { AdminStore } from '../admin/adminStore';

interface AtlasCintaTemplateProps {
  onBackToLanding: () => void;
  onOrderViaWhatsApp: () => void;
  customData?: ClientInvitationData;
}

const DEFAULT_ATLAS_GALLERY = [
  '/images/atlas_cinta_hero_cover_1791177934302.jpg',
  '/images/atlas_cinta_interlude_landscape_1791177985962.jpg',
  '/images/atlas_cinta_bride_portrait_1791177955237.jpg',
  '/images/atlas_cinta_groom_portrait_1791177974718.jpg',
  '/images/sage_outdoor_couple_portrait_1790919006777.jpg',
  '/images/botanical_estate_venue_1790919022237.jpg',
  '/images/film_vintage_couple_1791034007642.jpg',
  '/images/wedding_vows_bouquet_1790901516667.jpg',
  '/images/editorial_couple_portrait_1790838636662.jpg',
  '/images/wedding_dance_lights_1790901533590.jpg'
];

const DEFAULT_ITINERARY = [
  {
    time: '07.30',
    title: 'Registrasi tamu',
    description: 'Tamu undangan mengisi daftar hadir dan menerima suvenir.'
  },
  {
    time: '08.00',
    title: 'Akad nikah',
    description: 'Ijab kabul dalam lingkup keluarga dan kerabat dekat.'
  },
  {
    time: '09.30',
    title: 'Sesi foto keluarga',
    description: 'Foto bersama kedua keluarga besar.'
  },
  {
    time: '11.00',
    title: 'Resepsi dibuka',
    description: 'Tamu dipersilakan masuk, memberi doa, dan menikmati hidangan.'
  },
  {
    time: '14.00',
    title: 'Acara selesai',
    description: 'Terima kasih telah ikut dalam perjalanan kami.'
  }
];

const DEFAULT_STORY_TRAILS = [
  {
    date: 'Juli 2018',
    title: 'Pertemuan Pertama',
    description:
      'Bertemu di sebuah perjalanan backpacking ke Yogyakarta, berbagi peta dan rencana perjalanan yang ternyata berujung panjang.'
  },
  {
    date: 'Oktober 2021',
    title: 'Perjalanan ke Timur',
    description:
      'Menjelajah Nusa Tenggara berdua selama dua minggu, dan menyadari inilah teman perjalanan seumur hidup yang dicari.'
  },
  {
    date: 'Juli 2026',
    title: 'Lamaran',
    description:
      'Di puncak bukit tempat mereka pertama kali berkemah bersama, pertanyaan itu akhirnya diajukan di bawah langit senja.'
  }
];

const DEFAULT_DRESSCODE_SWATCHES = [
  { hex: '#1F2A3C', name: 'Biru malam' },
  { hex: '#F2E9D8', name: 'Krem kertas' },
  { hex: '#B4432F', name: 'Merah stempel' },
  { hex: '#6B7256', name: 'Hijau zaitun' }
];

export const AtlasCintaTemplate: React.FC<AtlasCintaTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData
}) => {
  // Data Mempelai & Acara (Custom atau Default Atlas Cinta: Wulan & Dimas)
  const brideName = customData?.brideName || 'Wulan';
  const brideFullName = customData?.brideFullName || 'Wulan Citra Maheswari';
  const brideParents =
    customData?.brideParents || 'Bapak Slamet Riyadi & Ibu Anita Kurniawati';

  const groomName = customData?.groomName || 'Dimas';
  const groomFullName = customData?.groomFullName || 'Dimas Prakoso Wibowo';
  const groomParents =
    customData?.groomParents || 'Bapak Joko Susanto & Ibu Lilis Nuraini';

  const eventDateFormatted = customData?.eventDateFormatted || 'Sabtu, 5 Desember 2026';
  const countdownIsoDate = customData?.countdownIsoDate || '2026-12-05T08:00:00+07:00';
  const akadTime = customData?.akadTime || 'Pukul 08.00 WIB';
  const resepsiTime = customData?.resepsiTime || 'Pukul 11.00 – 14.00 WIB';
  const resepsiVenue =
    customData?.resepsiVenue ||
    'Rumah Kayu Cikole, Jl. Raya Tangkuban Perahu KM 12';
  const city = customData?.city || 'Lembang, Jawa Barat';
  const fullLocation = customData?.resepsiVenue
    ? `${resepsiVenue}, ${city}`
    : 'Rumah Kayu Cikole, Jl. Raya Tangkuban Perahu KM 12, Lembang, Jawa Barat';
  const mapsUrl =
    customData?.mapsUrl ||
    'https://www.google.com/maps/search/?api=1&query=Rumah+Kayu+Cikole+Lembang';

  const quoteText =
    customData?.quoteText ||
    'Setiap perjalanan panjang dimulai dari satu langkah kecil — dan langkah kami dimulai dari sebuah nama yang kini menjadi tujuan.';
  const quoteSource = customData?.quoteSource || 'Prolog, Atlas Cinta';

  const bankName = customData?.bankName || 'BRI';
  const accountNumber = customData?.accountNumber || '0091234567890';
  const accountHolder = customData?.accountHolder || 'Wulan Citra Maheswari';
  const songTitle =
    customData?.songTitle || 'Atlas Perjalanan Senja - Acoustic Folk Guitar';

  // Media Slots
  const rawGallery =
    customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages.length > 0
      ? customData.mediaSlots.galleryImages
      : DEFAULT_ATLAS_GALLERY;

  const galleryPhotos = Array.from({ length: 10 }, (_, idx) => {
    return rawGallery[idx % rawGallery.length];
  });

  const heroCoverBg =
    customData?.mediaSlots?.heroImage ||
    '/images/atlas_cinta_hero_cover_1791177934302.jpg';
  const bridePortraitPhoto =
    customData?.mediaSlots?.bridePortrait ||
    '/images/atlas_cinta_bride_portrait_1791177955237.jpg';
  const groomPortraitPhoto =
    customData?.mediaSlots?.groomPortrait ||
    '/images/atlas_cinta_groom_portrait_1791177974718.jpg';
  const interludeBg =
    (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages[0]) ||
    '/images/atlas_cinta_interlude_landscape_1791177985962.jpg';
  const parallaxBg =
    (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages[1]) ||
    '/images/sage_outdoor_couple_portrait_1790919006777.jpg';
  const fullPlatePhoto =
    (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages[2]) ||
    '/images/atlas_cinta_bride_portrait_1791177955237.jpg';
  const footerClosingBg =
    (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages[3]) ||
    '/images/atlas_cinta_hero_cover_1791177934302.jpg';

  const storyTrails =
    customData?.mediaSlots?.storyChapters && customData.mediaSlots.storyChapters.length > 0
      ? customData.mediaSlots.storyChapters.map((ch) => ({
          date: ch.date,
          title: ch.title,
          description: ch.story
        }))
      : DEFAULT_STORY_TRAILS;

  const dresscodeSwatches =
    customData?.mediaSlots?.dresscodeSwatches &&
    customData.mediaSlots.dresscodeSwatches.length > 0
      ? customData.mediaSlots.dresscodeSwatches.map((sw) => ({
          hex: sw.hex,
          name: sw.name
        }))
      : DEFAULT_DRESSCODE_SWATCHES;

  // Hooks
  const { guestName: guestRecipient, hideGuestName } = useGuestRecipient(
    'Bapak/Ibu/Saudara/i Tamu Undangan'
  );
  const { isPlayingAudio, showAudioToast, toggleAudio, startAudio } =
    useAudioController(songTitle);
  const { copyText, isCopied } = useClipboardCopy(1800);
  const cd = useCountdown(countdownIsoDate);

  // State
  const [isGateOpened, setIsGateOpened] = useState(false);
  const [showPointCounter, setShowPointCounter] = useState(false);
  const [pointLabel, setPointLabel] = useState('Titik 01 / 13');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [calSaved, setCalSaved] = useState(false);
  const [activeCarouselDot, setActiveCarouselDot] = useState(0);

  // Desktop right floating pane state
  const [paneLayers, setPaneLayers] = useState<[string, string]>([
    heroCoverBg,
    heroCoverBg
  ]);
  const [activePaneIdx, setActivePaneIdx] = useState<0 | 1>(0);
  const [postcardInfo, setPostcardInfo] = useState({
    no: 'Titik 01',
    title: 'Awal Perjalanan',
    meta: 'Fotografi, 2026',
    show: true
  });
  const currentPaneSrcRef = useRef<string>(heroCoverBg);

  // Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  const carTrackRef = useRef<HTMLDivElement>(null);

  // Guestbook & RSVP
  const initialWishes =
    customData?.guestbookEntries && customData.guestbookEntries.length > 0
      ? customData.guestbookEntries
      : [
          {
            name: 'Dewi Anggraini',
            message:
              'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Bahagia selalu, Wulan & Dimas 🤍'
          },
          {
            name: 'Rendra & Sekar',
            message:
              'Selamat memulai petualangan terbesar seumur hidup! Semoga langkah kalian selalu diberkahi dan penuh cerita indah.'
          }
        ];

  const {
    wishes,
    nameInput,
    setNameInput,
    messageInput,
    setMessageInput,
    submitWish
  } = useGuestbook(initialWishes);

  const [attendanceInput, setAttendanceInput] = useState<'hadir' | 'ragu' | 'tidak_hadir'>('hadir');
  const [guestCountInput, setGuestCountInput] = useState(2);

  // Open Gate Handler
  const handleOpenGate = () => {
    setIsGateOpened(true);
    startAudio();
    setTimeout(() => {
      setShowPointCounter(true);
    }, 900);
  };

  // Scroll Reveal, Parallax, Point Counter & Desktop Right Floating Pane
  useEffect(() => {
    const mobileEl = mobileContentRef.current;
    if (!mobileEl) return;

    // 0. Auto-number "Titik NN" across all sections in #mobileContent
    const allSections = Array.from(
      mobileEl.querySelectorAll(':scope > section[data-section-type]')
    );
    const totalSections = allSections.length;

    allSections.forEach((sec, i) => {
      const n = `Titik ${String(i + 1).padStart(2, '0')}`;
      sec.querySelectorAll('.eyebrow, .point-no, .tag').forEach((el) => {
        if (el.textContent) {
          el.textContent = el.textContent.replace(/^Titik \d+/, n);
        }
      });
      sec.querySelectorAll('[data-pane-no]').forEach((el) => {
        el.setAttribute('data-pane-no', n);
      });
    });

    // 1. Scroll-Reveal Observer with staggered delay per section
    const revealEls = Array.from(
      mobileEl.querySelectorAll('.reveal, .reveal-scale')
    );
    const groups: Record<string, Element[]> = {};
    revealEls.forEach((el, idx) => {
      const parent = el.closest('section') || el.parentElement;
      const key = parent ? parent.id || `sec-${idx}` : 'g';
      if (!groups[key]) groups[key] = [];
      groups[key].push(el);
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const parent = el.closest('section') || el.parentElement;
            const key = parent ? parent.id || 'g' : 'g';
            const groupArr = groups[key] || [];
            const idx = Math.max(0, groupArr.indexOf(el));
            const delay = idx * 85;
            setTimeout(() => {
              el.classList.add('is-visible');
            }, delay);
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    // 2. Parallax & Scroll Progress
    const parallaxEls = Array.from(
      mobileEl.querySelectorAll<HTMLElement>('.js-parallax')
    );
    let ticking = false;

    const updateScrollEffects = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        if (!el.parentElement) return;
        const rect = el.parentElement.getBoundingClientRect();
        const progress = (vh - rect.top) / (vh + rect.height);
        const offset = (progress - 0.5) * 54;
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      });

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      setScrollProgress(p);
      ticking = false;
    };

    const onWindowScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    updateScrollEffects();

    // 3. Point Counter Observer
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = allSections.indexOf(entry.target) + 1;
            if (idx > 0) {
              setPointLabel(
                `Titik ${String(idx).padStart(2, '0')} / ${String(
                  totalSections
                ).padStart(2, '0')}`
              );
            }
          }
        });
      },
      { threshold: 0.45 }
    );

    allSections.forEach((s) => sectionObserver.observe(s));

    // 4. Desktop Floating Right Pane Observer
    interface PaneCandidate {
      el: Element;
      getSrc: () => string;
      no: string;
      title: string;
      meta: string;
    }

    const candidates: PaneCandidate[] = [];
    allSections.forEach((section) => {
      const override = section.querySelector('.pane-source');
      const contentImgs = section.querySelectorAll('img[data-photo-slot]');

      if (contentImgs.length > 0) {
        contentImgs.forEach((img) => {
          candidates.push({
            el: img,
            getSrc: () => {
              if (override && override.getAttribute('data-pane-image')) {
                return override.getAttribute('data-pane-image') || '';
              }
              return (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src;
            },
            no:
              img.getAttribute('data-pane-no') ||
              (override ? override.getAttribute('data-pane-no') || '' : '') ||
              'Titik 01',
            title:
              img.getAttribute('data-pane-title') ||
              (override ? override.getAttribute('data-pane-title') || '' : '') ||
              'Awal Perjalanan',
            meta:
              img.getAttribute('data-pane-meta') ||
              (override ? override.getAttribute('data-pane-meta') || '' : '') ||
              'Fotografi, 2026'
          });
        });
      } else if (override) {
        candidates.push({
          el: section,
          getSrc: () => override.getAttribute('data-pane-image') || '',
          no: override.getAttribute('data-pane-no') || 'Titik 01',
          title: override.getAttribute('data-pane-title') || 'Atlas Cinta',
          meta: override.getAttribute('data-pane-meta') || 'Catatan, 2026'
        });
      }
    });

    const visibleCandidates = new Set<PaneCandidate>();

    const triggerPaneSwap = (src: string, no: string, title: string, meta: string) => {
      if (!src || src === currentPaneSrcRef.current) return;
      currentPaneSrcRef.current = src;

      setActivePaneIdx((prev) => {
        const nextIdx = prev === 0 ? 1 : 0;
        setPaneLayers((layers) => {
          const updated: [string, string] = [...layers] as [string, string];
          updated[nextIdx] = src;
          return updated;
        });
        return nextIdx;
      });

      setPostcardInfo((prev) => ({ ...prev, show: false }));
      setTimeout(() => {
        setPostcardInfo({
          no: no || 'Titik 01',
          title: title || 'Atlas Cinta',
          meta: meta || 'Fotografi, 2026',
          show: true
        });
      }, 220);
    };

    const pickActiveCandidate = () => {
      if (visibleCandidates.size === 0) return;
      const viewportCenter = window.innerHeight / 2;
      let best: PaneCandidate | null = null;
      let bestDist = Infinity;

      visibleCandidates.forEach((cand) => {
        const rect = cand.el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - viewportCenter);
        if (dist < bestDist) {
          bestDist = dist;
          best = cand;
        }
      });

      if (best) {
        const chosen = best as PaneCandidate;
        triggerPaneSwap(chosen.getSrc(), chosen.no, chosen.title, chosen.meta);
      }
    };

    const paneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cand = candidates.find((c) => c.el === entry.target);
          if (!cand) return;
          if (entry.isIntersecting) {
            visibleCandidates.add(cand);
          } else {
            visibleCandidates.delete(cand);
          }
        });
        pickActiveCandidate();
      },
      { threshold: [0, 0.3, 0.6] }
    );

    candidates.forEach((cand) => paneObserver.observe(cand.el));

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      paneObserver.disconnect();
      window.removeEventListener('scroll', onWindowScroll);
    };
  }, [
    heroCoverBg,
    bridePortraitPhoto,
    groomPortraitPhoto,
    interludeBg,
    parallaxBg,
    fullPlatePhoto,
    footerClosingBg
  ]);

  // Carousel scroll observer for active dots
  useEffect(() => {
    const track = carTrackRef.current;
    if (!track) return;
    const slides = Array.from(track.querySelectorAll('figure'));
    const slideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = slides.indexOf(entry.target as HTMLElement);
            if (idx >= 0) setActiveCarouselDot(idx);
          }
        });
      },
      { root: track, threshold: 0.6 }
    );
    slides.forEach((s) => slideObserver.observe(s));
    return () => slideObserver.disconnect();
  }, []);

  const scrollCarousel = (dir: -1 | 1) => {
    const track = carTrackRef.current;
    if (!track) return;
    const firstSlide = track.querySelector('figure');
    const slideW = firstSlide ? firstSlide.getBoundingClientRect().width + 12 : 260;
    track.scrollBy({ left: dir * slideW, behavior: 'smooth' });
  };

  // Save to Calendar (.ics)
  const handleSaveCalendarIcs = () => {
    const cleanSummary = `Pernikahan ${brideName} & ${groomName}`;
    const cleanLocation = fullLocation.replace(/,/g, '\\,');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sekarsiti Undangan Digital//ID',
      'BEGIN:VEVENT',
      `UID:pernikahan-${Date.now()}@sekarsiti`,
      'DTSTAMP:20261001T000000Z',
      'DTSTART:20261205T010000Z',
      'DTEND:20261205T070000Z',
      `SUMMARY:${cleanSummary}`,
      `LOCATION:${cleanLocation}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `pernikahan-${brideName.toLowerCase().replace(/\s+/g, '-')}-${groomName
      .toLowerCase()
      .replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setCalSaved(true);
    setTimeout(() => setCalSaved(false), 1800);
  };

  // Guestbook Submit
  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !messageInput.trim()) return;

    if (customData?.id) {
      AdminStore.addGuestbook(customData.id, {
        name: nameInput.trim(),
        message: messageInput.trim()
      });
      AdminStore.addRsvp(customData.id, {
        name: nameInput.trim(),
        attendance: attendanceInput,
        count: guestCountInput
      });
    }

    submitWish(e);
  };

  return (
    <div
      ref={rootRef}
      className={`atlas-cinta-root min-h-screen pt-[44px] ${
        isGateOpened ? 'is-open' : 'max-h-screen overflow-hidden'
      }`}
    >
      <style>{`
        .atlas-cinta-root {
          --cream: #F2E9D8;
          --cream-2: #E8DCC0;
          --navy: #1F2A3C;
          --navy-2: #283548;
          --stamp: #B4432F;
          --olive: #6B7256;
          --ink-soft: #6B6455;
          --line-light: rgba(31,42,60,0.16);
          --line-dark: rgba(242,233,216,0.16);
          --ease: cubic-bezier(.22,.61,.36,1);
          --frame-w: 440px;
          --gap: 26px;
          background: var(--cream);
          color: var(--navy);
          font-family: 'Space Grotesk', sans-serif;
          line-height: 1.65;
          font-size: 16px;
        }
        .atlas-cinta-root img {
          display: block;
          max-width: 100%;
          height: auto;
        }
        .atlas-cinta-root h1,
        .atlas-cinta-root h2,
        .atlas-cinta-root h3,
        .atlas-cinta-root .serif {
          font-family: 'Spectral', serif;
          font-weight: 500;
        }
        .atlas-cinta-root .mono {
          font-family: 'Courier Prime', monospace;
        }
        .atlas-cinta-root .eyebrow {
          font-family: 'Courier Prime', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--stamp);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .atlas-cinta-root .eyebrow::before {
          content: "\\2708";
          font-size: 0.85em;
        }
        .atlas-cinta-root .wrap {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 26px;
        }
        .atlas-cinta-root section {
          position: relative;
        }

        .atlas-cinta-root .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .85s var(--ease), transform .85s var(--ease);
        }
        .atlas-cinta-root .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .atlas-cinta-root .reveal-scale {
          opacity: 0;
          transform: scale(.95);
          transition: opacity .95s var(--ease), transform 1s var(--ease);
        }
        .atlas-cinta-root .reveal-scale.is-visible {
          opacity: 1;
          transform: scale(1);
        }

        /* ================================================================
           GATE — sampul jurnal perjalanan
        ================================================================= */
        .atlas-cinta-root #gate {
          position: fixed;
          inset: 44px 0 0 0;
          z-index: 60;
          background: var(--navy);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 1s var(--ease), opacity 1s var(--ease);
        }
        .atlas-cinta-root #gate.opened {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
        }
        .atlas-cinta-root .gate-card {
          width: min(310px, 84vw);
          background: var(--cream);
          color: var(--navy);
          padding: 36px 26px;
          text-align: center;
          cursor: pointer;
          position: relative;
          box-shadow: 0 40px 90px -30px rgba(0,0,0,0.6);
          border-radius: 6px;
          animation: atlasRise .9s var(--ease) both;
        }
        .atlas-cinta-root .gate-stamp {
          width: 56px;
          height: 56px;
          border: 2px dashed var(--stamp);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          color: var(--stamp);
          font-family: 'Courier Prime', monospace;
          font-size: 0.6rem;
          --r: -8deg;
          transform: rotate(-8deg);
          animation: atlasStampIn .6s var(--ease) .6s both;
        }
        .atlas-cinta-root .gate-title {
          font-size: clamp(1.7rem, 7vw, 2.1rem);
          font-style: italic;
          margin-bottom: 8px;
          font-family: 'Spectral', serif;
        }
        .atlas-cinta-root .gate-sub {
          font-size: 0.76rem;
          color: var(--ink-soft);
          margin-bottom: 24px;
          font-family: 'Courier Prime', monospace;
        }
        .atlas-cinta-root .gate-cta {
          display: inline-block;
          font-family: 'Courier Prime', monospace;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid var(--navy);
          padding: 11px 20px;
          border-radius: 3px;
          position: relative;
        }
        .atlas-cinta-root .gate-cta::after {
          content: "";
          position: absolute;
          inset: -5px;
          border: 1px solid var(--navy);
          border-radius: 5px;
          opacity: 0;
          animation: atlasRing 2.6s ease-out 1.8s infinite;
        }

        .atlas-cinta-root #pointCounter {
          position: fixed;
          z-index: 40;
          bottom: 16px;
          left: 16px;
          font-family: 'Courier Prime', monospace;
          font-size: 0.64rem;
          letter-spacing: 0.03em;
          color: var(--cream);
          background: var(--navy);
          padding: 7px 11px;
          border-radius: 3px;
          opacity: 0;
          transition: opacity .5s ease;
          pointer-events: none;
          border: 1px solid rgba(242,233,216,0.18);
        }
        .atlas-cinta-root #pointCounter.show {
          opacity: 0.92;
        }
        .atlas-cinta-root #pointCounter::after {
          content: "";
          display: block;
          height: 2px;
          margin-top: 6px;
          background: linear-gradient(90deg, var(--stamp) calc(var(--p, 0) * 100%), rgba(242,233,216,.25) 0);
        }

        /* ================================================================
           APP SHELL — DUA PANEL MENGAMBANG (KONTEN KIRI, PANEL FOTO KANAN)
        ================================================================= */
        .atlas-cinta-root #appShell {
          background: var(--cream);
        }
        .atlas-cinta-root #deskPane {
          display: none;
        }
        .atlas-cinta-root #mobileContent {
          background: var(--cream);
          position: relative;
          z-index: 1;
        }

        @media (min-width: 980px) {
          .atlas-cinta-root {
            background: var(--navy);
          }
          .atlas-cinta-root #appShell {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: var(--gap);
            padding: var(--gap);
            background: var(--navy);
          }
          .atlas-cinta-root #mobileContent {
            width: var(--frame-w);
            flex-shrink: 0;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 50px 100px -30px rgba(0,0,0,0.6);
          }
          .atlas-cinta-root #deskPane {
            display: block;
            position: sticky;
            top: calc(44px + var(--gap));
            height: calc(100vh - 44px - (var(--gap) * 2));
            flex: 1 1 640px;
            min-width: 320px;
            max-width: 820px;
            overflow: hidden;
            border-radius: 20px;
            background: var(--navy-2);
            box-shadow: 0 50px 100px -30px rgba(0,0,0,0.6);
          }
          .atlas-cinta-root #deskPane .pane-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 1.1s var(--ease);
          }
          .atlas-cinta-root #deskPane .pane-img.active {
            opacity: 1;
          }
          .atlas-cinta-root #deskPane .pane-scrim {
            position: absolute;
            inset: 0;
            background: linear-gradient(0deg, rgba(31,42,60,0.55) 0%, rgba(31,42,60,0.05) 40%);
          }
          .atlas-cinta-root #deskPane .pane-postcard {
            position: absolute;
            right: 28px;
            bottom: 28px;
            z-index: 3;
            background: var(--cream);
            color: var(--navy);
            padding: 16px 20px;
            min-width: 210px;
            max-width: 320px;
            border-radius: 8px;
            opacity: 0;
            transform: translateY(10px) rotate(1.5deg);
            transition: opacity .5s ease, transform .5s ease;
            box-shadow: 0 24px 50px -20px rgba(0,0,0,0.5);
          }
          .atlas-cinta-root #deskPane .pane-postcard.show {
            opacity: 1;
            transform: translateY(0) rotate(1.5deg);
          }
          .atlas-cinta-root #deskPane .pane-postcard .p-no {
            font-family: 'Courier Prime', monospace;
            font-size: 0.62rem;
            color: var(--stamp);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .atlas-cinta-root #deskPane .pane-postcard .p-title {
            font-family: 'Spectral', serif;
            font-style: italic;
            font-size: 1.1rem;
            margin-bottom: 4px;
          }
          .atlas-cinta-root #deskPane .pane-postcard .p-meta {
            font-family: 'Courier Prime', monospace;
            font-size: 0.6rem;
            color: var(--ink-soft);
          }
          .atlas-cinta-root #deskPane .corner-tag {
            position: absolute;
            top: 26px;
            left: 28px;
            z-index: 3;
            color: var(--cream);
            font-family: 'Courier Prime', monospace;
            font-size: 0.62rem;
            letter-spacing: 0.06em;
            opacity: 0.8;
          }
        }

        /* ================================================================
           HERO / SAMPUL — TITIK AWAL
        ================================================================= */
        .atlas-cinta-root #hero {
          min-height: calc(100svh - 44px);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
          color: var(--cream);
        }
        .atlas-cinta-root #hero .bg-layer {
          position: absolute;
          inset: -8% 0 0 0;
          height: 116%;
          z-index: 0;
          animation: atlasKb 24s ease-in-out infinite alternate;
        }
        .atlas-cinta-root #hero .bg-layer img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: sepia(0.12) brightness(0.5);
        }
        .atlas-cinta-root #hero .bg-scrim {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(180deg, rgba(31,42,60,0.1) 0%, rgba(31,42,60,0.25) 40%, rgba(31,42,60,0.95) 100%);
        }
        .atlas-cinta-root #hero .hero-content {
          position: relative;
          z-index: 2;
          padding: 0 26px 56px;
        }
        .atlas-cinta-root #hero .point-no {
          font-family: 'Courier Prime', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          color: var(--stamp);
          margin-bottom: 16px;
        }
        .atlas-cinta-root #hero h1 {
          font-size: clamp(2.4rem, 11vw, 3.4rem);
          line-height: 1.02;
          font-style: italic;
          font-weight: 400;
        }
        .atlas-cinta-root #hero .amp {
          display: block;
          font-family: 'Spectral', serif;
          font-style: normal;
          font-size: 0.5em;
          color: var(--stamp);
          margin: 4px 0;
        }
        .atlas-cinta-root #hero .hero-tag {
          margin-top: 18px;
          font-family: 'Courier Prime', monospace;
          font-size: 0.66rem;
          letter-spacing: 0.03em;
          opacity: 0.78;
        }
        .atlas-cinta-root .scroll-cue {
          position: absolute;
          bottom: 16px;
          right: 20px;
          z-index: 2;
          writing-mode: vertical-rl;
          font-family: 'Courier Prime', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.08em;
          color: var(--cream);
          opacity: 0.55;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .atlas-cinta-root .scroll-cue span {
          width: 1px;
          height: 28px;
          background: var(--cream);
          display: block;
          opacity: 0.55;
        }
        .atlas-cinta-root .route {
          position: relative;
          width: 300px;
          height: 60px;
          margin-bottom: 6px;
        }
        .atlas-cinta-root .route i {
          position: absolute;
          left: 0;
          top: 0;
          font-style: normal;
          font-size: 16px;
          line-height: 1;
          color: var(--cream);
          offset-path: path('M10 50 Q150 -20 290 40');
          offset-rotate: auto;
        }
        .atlas-cinta-root.is-open .route svg {
          animation: atlasWipe 2.6s var(--ease) .7s both;
        }
        .atlas-cinta-root.is-open .route i {
          animation: atlasFly 2.6s var(--ease) .7s both;
        }
        .atlas-cinta-root.is-open #hero .hero-content > * {
          animation: atlasRise 1s var(--ease) both;
        }
        .atlas-cinta-root.is-open #hero .hero-content > :nth-child(2) { animation-delay: .35s; }
        .atlas-cinta-root.is-open #hero .hero-content > :nth-child(3) { animation-delay: .55s; }
        .atlas-cinta-root.is-open #hero .hero-content > :nth-child(4) { animation-delay: .8s; }

        /* ================================================================
           PROLOG PERJALANAN
        ================================================================= */
        .atlas-cinta-root .prolog {
          background: var(--cream-2);
          padding: 80px 0 66px;
          text-align: center;
        }
        .atlas-cinta-root .prolog .ornament {
          width: 38px;
          height: 1px;
          background: var(--stamp);
          margin: 0 auto 22px;
        }
        .atlas-cinta-root .prolog blockquote {
          font-family: 'Spectral', serif;
          font-style: italic;
          font-size: clamp(1.25rem, 5.5vw, 1.65rem);
          line-height: 1.5;
          color: var(--navy-2);
        }
        .atlas-cinta-root .prolog cite {
          display: block;
          margin-top: 18px;
          font-family: 'Courier Prime', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.04em;
          font-style: normal;
          color: var(--stamp);
        }

        /* ================================================================
           DUA PENJELAJAH — mempelai
        ================================================================= */
        .atlas-cinta-root #mempelai {
          padding: 82px 0 62px;
          background: var(--cream);
        }
        .atlas-cinta-root .traveler-block {
          text-align: center;
          padding: 22px 0;
          border-top: 1px dashed var(--line-light);
          transition: transform 0.25s ease;
        }
        .atlas-cinta-root .traveler-block:last-of-type {
          border-bottom: 1px dashed var(--line-light);
        }
        .atlas-cinta-root .traveler-block .role {
          font-family: 'Courier Prime', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.06em;
          color: var(--olive);
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .atlas-cinta-root .traveler-block h2 {
          font-size: clamp(1.8rem, 7vw, 2.3rem);
          font-style: italic;
          margin-bottom: 8px;
        }
        .atlas-cinta-root .traveler-block .parents {
          font-size: 0.87rem;
          color: var(--ink-soft);
        }
        .atlas-cinta-root .traveler-block .parents b {
          color: var(--navy);
          font-weight: 600;
        }
        .atlas-cinta-root .traveler-divider {
          text-align: center;
          font-family: 'Spectral', serif;
          font-style: italic;
          font-size: 1.05rem;
          color: var(--stamp);
          padding: 8px 0;
        }

        /* ================================================================
           INTERLUDE FOTO BESAR
        ================================================================= */
        .atlas-cinta-root .interlude {
          position: relative;
          height: 72vh;
          min-height: 380px;
          overflow: hidden;
        }
        .atlas-cinta-root .interlude img {
          width: 100%;
          height: 120%;
          object-fit: cover;
        }
        .atlas-cinta-root .interlude .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(31,42,60,0.5), transparent 45%);
        }
        .atlas-cinta-root .interlude .caption {
          position: absolute;
          bottom: 20px;
          left: 20px;
          z-index: 2;
          color: var(--cream);
          font-family: 'Courier Prime', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.03em;
          background: rgba(31,42,60,0.55);
          padding: 7px 11px;
          border-radius: 3px;
        }

        /* ================================================================
           TIKET & KOORDINAT — waktu & tempat (boarding pass)
        ================================================================= */
        .atlas-cinta-root #waktu {
          padding: 82px 0;
          background: var(--navy);
          color: var(--cream);
        }
        .atlas-cinta-root #waktu .eyebrow {
          color: var(--stamp);
        }
        .atlas-cinta-root .ticket-row {
          border-top: 1px dashed var(--line-dark);
          padding: 22px 0;
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 16px;
        }
        .atlas-cinta-root .ticket-row .num {
          font-family: 'Courier Prime', monospace;
          font-size: 0.68rem;
          color: var(--stamp);
        }
        .atlas-cinta-root .ticket-row h3 {
          font-size: 1.28rem;
          font-style: italic;
          margin-bottom: 6px;
        }
        .atlas-cinta-root .ticket-row .meta {
          font-size: 0.87rem;
          opacity: 0.8;
        }
        .atlas-cinta-root .ticket-row .meta b {
          color: var(--cream);
          font-weight: 600;
          opacity: 1;
        }
        .atlas-cinta-root .boarding {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 30px;
          border: 1px dashed var(--line-dark);
          border-radius: 6px;
        }
        .atlas-cinta-root .bp-cell {
          text-align: center;
          padding: 16px 4px;
          border-right: 1px dashed var(--line-dark);
        }
        .atlas-cinta-root .bp-cell:last-child {
          border-right: 0;
        }
        .atlas-cinta-root .bp-cell b {
          display: block;
          font-family: 'Courier Prime', monospace;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--cream);
        }
        .atlas-cinta-root .bp-cell span {
          font-family: 'Courier Prime', monospace;
          font-size: .58rem;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--stamp);
        }
        .atlas-cinta-root .cal-btn {
          margin-top: 22px;
          width: 100%;
          background: transparent;
          border: 1px solid var(--cream);
          color: var(--cream);
          padding: 13px;
          font-family: 'Courier Prime', monospace;
          font-size: .66rem;
          letter-spacing: .06em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 4px;
          transition: background .3s var(--ease), color .3s var(--ease);
        }
        .atlas-cinta-root .cal-btn:hover,
        .atlas-cinta-root .cal-btn.done {
          background: var(--cream);
          color: var(--navy);
        }

        /* ================================================================
           ITINERARY, JEJAK PERJALANAN, PETA LOKASI & DRESSCODE
        ================================================================= */
        .atlas-cinta-root #itinerary,
        .atlas-cinta-root #kisah,
        .atlas-cinta-root #dresscode {
          padding: 82px 0 60px;
          background: var(--cream);
        }
        .atlas-cinta-root #lokasi {
          padding: 82px 0;
          background: var(--cream-2);
        }
        .atlas-cinta-root .sub {
          font-size: .64rem;
          color: var(--ink-soft);
          margin-bottom: 26px;
        }
        .atlas-cinta-root .trail-item {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 16px;
          padding-bottom: 30px;
          position: relative;
        }
        .atlas-cinta-root .trail-item::before {
          content: "";
          position: absolute;
          left: 27px;
          top: 6px;
          bottom: 0;
          width: 1px;
          background: var(--line-light);
          border-left: 1px dashed var(--line-light);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 1.2s var(--ease) .3s;
        }
        .atlas-cinta-root .trail-item.is-visible::before {
          transform: scaleY(1);
        }
        .atlas-cinta-root .trail-item:last-child::before {
          display: none;
        }
        .atlas-cinta-root .trail-item .dot {
          width: 9px;
          height: 9px;
          border: 1.5px solid var(--stamp);
          border-radius: 50%;
          margin-top: 5px;
          justify-self: center;
          position: relative;
          z-index: 1;
          background: var(--cream);
        }
        .atlas-cinta-root .trail-item .date {
          font-family: 'Courier Prime', monospace;
          font-size: 0.6rem;
          color: var(--stamp);
          margin-bottom: 4px;
        }
        .atlas-cinta-root .trail-item h4 {
          font-size: 1.08rem;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .atlas-cinta-root .trail-item p {
          font-size: 0.88rem;
          color: var(--ink-soft);
        }

        .atlas-cinta-root .atlas-map {
          width: 100%;
          height: auto;
          margin: 22px 0;
          border: 1px solid var(--line-light);
          border-radius: 6px;
          background: var(--cream);
        }
        .atlas-cinta-root .contours * {
          fill: none;
          stroke: var(--olive);
          stroke-opacity: .45;
          stroke-width: 1;
        }
        .atlas-cinta-root .route-line {
          fill: none;
          stroke: var(--stamp);
          stroke-width: 1.5;
          stroke-dasharray: 5 5;
          animation: atlasMarch 1.2s linear infinite;
        }
        .atlas-cinta-root .map-pin {
          fill: var(--stamp);
        }
        .atlas-cinta-root .map-ring {
          fill: none;
          stroke: var(--stamp);
          transform-box: fill-box;
          transform-origin: center;
          animation: atlasPing 2.4s ease-out infinite;
        }
        .atlas-cinta-root .map-txt {
          font: 8px 'Courier Prime', monospace;
          fill: var(--navy);
        }
        .atlas-cinta-root .maps-btn {
          display: block;
          text-align: center;
          margin-top: 18px;
          border: 1px solid var(--navy);
          color: var(--navy);
          padding: 12px;
          font-family: 'Courier Prime', monospace;
          font-size: .66rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 3px;
          transition: background .3s var(--ease), color .3s var(--ease);
        }
        .atlas-cinta-root .maps-btn:hover {
          background: var(--navy);
          color: var(--cream);
        }
        .atlas-cinta-root .loc-note {
          font-size: .84rem;
          color: var(--ink-soft);
          margin-top: 16px;
        }
        .atlas-cinta-root .dress-note {
          font-size: .88rem;
          color: var(--ink-soft);
        }
        .atlas-cinta-root .dress-row {
          display: flex;
          gap: 10px;
          margin-top: 26px;
        }
        .atlas-cinta-root .dress-sw {
          flex: 1;
        }
        .atlas-cinta-root .dress-chip {
          height: 92px;
          border: 1px solid var(--line-light);
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .atlas-cinta-root .dress-name {
          font-family: 'Courier Prime', monospace;
          font-size: .6rem;
          color: var(--ink-soft);
          line-height: 1.4;
        }

        /* ================================================================
           DIVIDER KOMPAS
        ================================================================= */
        .atlas-cinta-root .compass-divider {
          padding: 52px 0;
          text-align: center;
          background: var(--cream-2);
        }
        .atlas-cinta-root .compass-divider svg {
          width: 42px;
          height: 42px;
          display: inline-block;
          animation: atlasSwing 7s ease-in-out infinite;
          transform-origin: center;
        }

        /* ================================================================
           KARTU POS — galeri
        ================================================================= */
        .atlas-cinta-root #galeri {
          background: var(--cream);
          padding: 82px 0 26px;
        }
        .atlas-cinta-root #galeri .head {
          padding-bottom: 34px;
        }
        .atlas-cinta-root .plate-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
          padding: 0 4px;
        }
        .atlas-cinta-root .plate-grid figure {
          position: relative;
          overflow: hidden;
          background: var(--cream-2);
          border-radius: 2px;
        }
        .atlas-cinta-root .plate-grid figure.tall {
          aspect-ratio: 3/4;
        }
        .atlas-cinta-root .plate-grid figure.wide {
          aspect-ratio: 4/3;
        }
        .atlas-cinta-root .plate-grid figure img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.5s var(--ease);
        }
        .atlas-cinta-root .plate-grid figure:hover img {
          transform: scale(1.05);
        }
        .atlas-cinta-root .plate-grid figcaption {
          position: absolute;
          bottom: 8px;
          left: 8px;
          z-index: 2;
          font-family: 'Courier Prime', monospace;
          font-size: 0.56rem;
          color: var(--cream);
          background: rgba(31,42,60,0.55);
          padding: 5px 8px;
          border-radius: 2px;
        }

        @media (min-width: 980px) {
          .atlas-cinta-root .plate-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
            padding: 0 5px;
          }
          .atlas-cinta-root .plate-grid figure:nth-child(1) {
            grid-column: span 2;
            grid-row: span 2;
          }
          .atlas-cinta-root .plate-grid figure.tall {
            aspect-ratio: auto;
          }
        }

        .atlas-cinta-root .carousel-wrap {
          margin-top: 44px;
          padding-left: 26px;
        }
        .atlas-cinta-root .carousel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 26px;
          margin-bottom: 16px;
        }
        .atlas-cinta-root .carousel-nav {
          display: flex;
          gap: 8px;
        }
        .atlas-cinta-root .carousel-nav button {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid var(--line-light);
          background: var(--cream);
          cursor: pointer;
          font-family: 'Courier Prime', monospace;
          font-size: 0.82rem;
          color: var(--navy);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .3s, color .3s;
        }
        .atlas-cinta-root .carousel-nav button:hover {
          background: var(--navy);
          color: var(--cream);
        }
        .atlas-cinta-root .carousel-track {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 18px;
          scrollbar-width: none;
        }
        .atlas-cinta-root .carousel-track::-webkit-scrollbar {
          display: none;
        }
        .atlas-cinta-root .carousel-track figure {
          flex: 0 0 74%;
          scroll-snap-align: start;
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
          background: var(--cream-2);
          border-radius: 4px;
        }
        .atlas-cinta-root .carousel-track figure img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .atlas-cinta-root .carousel-track figcaption {
          position: absolute;
          bottom: 8px;
          left: 8px;
          font-family: 'Courier Prime', monospace;
          font-size: 0.56rem;
          color: var(--cream);
          background: rgba(31,42,60,0.55);
          padding: 5px 8px;
          border-radius: 2px;
        }
        .atlas-cinta-root .carousel-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 14px;
          padding-right: 26px;
        }
        .atlas-cinta-root .carousel-dots i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--line-light);
          display: block;
          transition: background .3s, transform .3s;
        }
        .atlas-cinta-root .carousel-dots i.active {
          background: var(--stamp);
          transform: scale(1.4);
        }

        /* ================================================================
           PARALLAX BAND
        ================================================================= */
        .atlas-cinta-root .parallax-band {
          position: relative;
          height: 48vh;
          min-height: 300px;
          overflow: hidden;
          margin-top: 64px;
        }
        .atlas-cinta-root .parallax-band .js-parallax {
          position: absolute;
          inset: -15% 0;
          height: 130%;
          width: 100%;
          object-fit: cover;
          will-change: transform;
        }
        .atlas-cinta-root .parallax-band .band-scrim {
          position: absolute;
          inset: 0;
          background: rgba(31,42,60,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .atlas-cinta-root .parallax-band .band-text {
          color: var(--cream);
          text-align: center;
          font-family: 'Spectral', serif;
          font-style: italic;
          font-size: clamp(1.25rem, 6vw, 1.9rem);
          padding: 0 30px;
        }

        /* ================================================================
           OLEH-OLEH & KADO
        ================================================================= */
        .atlas-cinta-root #hadiah {
          padding: 82px 0;
          background: var(--cream-2);
          text-align: center;
        }
        .atlas-cinta-root .gift-card {
          max-width: 420px;
          margin: 30px auto 0;
          border: 1px dashed var(--line-light);
          background: var(--cream);
          padding: 32px 24px;
          position: relative;
          border-radius: 8px;
        }
        .atlas-cinta-root .gift-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: repeating-linear-gradient(90deg, var(--stamp) 0 8px, transparent 8px 16px);
          border-radius: 8px 8px 0 0;
        }
        .atlas-cinta-root .gift-card p {
          font-size: 0.9rem;
          color: var(--ink-soft);
          line-height: 1.7;
        }
        .atlas-cinta-root .gift-card .seal {
          width: 42px;
          height: 42px;
          border: 2px dashed var(--stamp);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: var(--stamp);
          font-size: 1.1rem;
        }

        /* ================================================================
           POTRET PERJALANAN — full plate
        ================================================================= */
        .atlas-cinta-root .full-plate {
          position: relative;
        }
        .atlas-cinta-root .full-plate img {
          width: 100%;
          height: auto;
          display: block;
        }
        .atlas-cinta-root .full-plate .tag {
          position: absolute;
          top: 18px;
          left: 18px;
          font-family: 'Courier Prime', monospace;
          font-size: 0.58rem;
          color: var(--cream);
          background: rgba(31,42,60,0.55);
          padding: 6px 10px;
          border-radius: 2px;
        }

        /* ================================================================
           BUKU PERJALANAN — guestbook
        ================================================================= */
        .atlas-cinta-root #guestbook {
          padding: 82px 0 92px;
          background: var(--navy);
          color: var(--cream);
        }
        .atlas-cinta-root #guestbook .eyebrow {
          color: var(--stamp);
        }
        .atlas-cinta-root #guestbook h2 {
          font-size: clamp(1.75rem, 7vw, 2.15rem);
          font-style: italic;
          margin-bottom: 30px;
        }
        .atlas-cinta-root .wish-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 38px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .atlas-cinta-root .wish-card {
          background: rgba(242,233,216,0.05);
          border: 1px solid var(--line-dark);
          padding: 16px 18px;
          border-radius: 4px;
        }
        .atlas-cinta-root .wish-card .who {
          font-family: 'Courier Prime', monospace;
          font-size: 0.62rem;
          color: var(--stamp);
          margin-bottom: 8px;
        }
        .atlas-cinta-root .wish-card .msg {
          font-size: 0.88rem;
          line-height: 1.6;
          color: rgba(242,233,216,0.9);
        }
        .atlas-cinta-root .guest-form {
          border-top: 1px dashed var(--line-dark);
          padding-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .atlas-cinta-root .guest-form input,
        .atlas-cinta-root .guest-form select,
        .atlas-cinta-root .guest-form textarea {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--line-dark);
          color: var(--cream);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.9rem;
          padding: 10px 2px;
          outline: none;
          transition: border-color .3s ease;
        }
        .atlas-cinta-root .guest-form select option {
          background: var(--navy);
          color: var(--cream);
        }
        .atlas-cinta-root .guest-form input::placeholder,
        .atlas-cinta-root .guest-form textarea::placeholder {
          color: rgba(242,233,216,0.4);
        }
        .atlas-cinta-root .guest-form input:focus,
        .atlas-cinta-root .guest-form select:focus,
        .atlas-cinta-root .guest-form textarea:focus {
          border-color: var(--stamp);
        }
        .atlas-cinta-root .guest-form textarea {
          resize: vertical;
          min-height: 64px;
        }
        .atlas-cinta-root .guest-form button {
          align-self: flex-start;
          margin-top: 6px;
          background: var(--stamp);
          color: var(--cream);
          border: none;
          font-family: 'Courier Prime', monospace;
          font-size: 0.66rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 13px 22px;
          cursor: pointer;
          border-radius: 4px;
          transition: background .3s ease, transform .3s ease;
        }
        .atlas-cinta-root .guest-form button:hover {
          background: var(--cream);
          color: var(--navy);
          transform: translateY(-2px);
        }
        .atlas-cinta-root .form-note {
          font-size: 0.64rem;
          opacity: 0.5;
          font-family: 'Courier Prime', monospace;
        }

        /* ================================================================
           TITIK AKHIR ... AWAL BARU
        ================================================================= */
        .atlas-cinta-root #footer-static {
          position: relative;
          min-height: 64vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: var(--cream);
          text-align: center;
        }
        .atlas-cinta-root #footer-static .bg-layer {
          position: absolute;
          inset: 0;
        }
        .atlas-cinta-root #footer-static .bg-layer img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: sepia(0.15) brightness(0.46);
        }
        .atlas-cinta-root #footer-static .scrim {
          position: absolute;
          inset: 0;
          background: rgba(31,42,60,0.4);
        }
        .atlas-cinta-root #footer-static .content {
          position: relative;
          z-index: 2;
          padding: 24px;
        }
        .atlas-cinta-root #footer-static .ornament {
          width: 36px;
          height: 1px;
          background: var(--stamp);
          margin: 0 auto 18px;
        }
        .atlas-cinta-root #footer-static h2 {
          font-size: clamp(1.65rem, 7vw, 2.2rem);
          font-style: italic;
          margin-bottom: 12px;
        }
        .atlas-cinta-root #footer-static p {
          font-family: 'Courier Prime', monospace;
          font-size: 0.66rem;
          letter-spacing: 0.03em;
          opacity: 0.7;
        }
        .atlas-cinta-root #footer-static .end-mark {
          margin-top: 26px;
          font-family: 'Courier Prime', monospace;
          font-size: 0.56rem;
          letter-spacing: 0.06em;
          opacity: 0.5;
        }

        .atlas-cinta-root .pane-source {
          display: none;
        }

        @keyframes atlasStampIn {
          0% { transform: scale(2.2) rotate(-24deg); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: scale(1) rotate(var(--r, 0deg)); opacity: 1; }
        }
        @keyframes atlasRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes atlasRing {
          from { opacity: .5; transform: scale(1); }
          to { opacity: 0; transform: scale(1.25); }
        }
        @keyframes atlasPing {
          from { transform: scale(.5); opacity: .9; }
          to { transform: scale(3); opacity: 0; }
        }
        @keyframes atlasWipe {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0 0 0); }
        }
        @keyframes atlasFly {
          from { offset-distance: 0%; }
          to { offset-distance: 100%; }
        }
        @keyframes atlasMarch {
          to { stroke-dashoffset: -20; }
        }
        @keyframes atlasSwing {
          0%, 100% { transform: rotate(-14deg); }
          50% { transform: rotate(14deg); }
        }
        @keyframes atlasKb {
          from { transform: scale(1); }
          to { transform: scale(1.07); }
        }
      `}</style>

      {/* ============================================================
          TOP DEMO BAR (Sekarsiti Navigation)
          ============================================================ */}
      {!customData && (
        <header className="fixed top-0 left-0 right-0 z-70 bg-[#1F2A3C]/95 backdrop-blur-md border-b border-[#F2E9D8]/15 text-[#F2E9D8] px-4 sm:px-6 h-[44px] flex items-center justify-between text-xs">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-[#F2E9D8]/90 hover:text-white transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#B4432F]" />
            <span>Kembali ke Sekarsiti</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[#F2E9D8]/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B4432F] animate-pulse" />
            <span className="font-['Courier_Prime',monospace] text-xs tracking-wider uppercase">
              Atlas Cinta · {brideName} &amp; {groomName}
            </span>
          </div>

          <button
            onClick={onOrderViaWhatsApp}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#B4432F] hover:bg-[#9c3725] text-[#F2E9D8] font-semibold rounded-sm shadow-sm transition-all active:scale-95 cursor-pointer font-['Courier_Prime',monospace] uppercase tracking-wider text-[11px]"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan Desain Ini</span>
          </button>
        </header>
      )}

      {/* Floating Audio Controller */}
      {isGateOpened && (
        <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-3 pointer-events-auto">
          {showAudioToast && (
            <div className="hidden sm:flex items-center gap-2 py-1.5 px-3.5 bg-[#1F2A3C]/95 backdrop-blur-md border border-[#F2E9D8]/20 text-[#F2E9D8] rounded-sm text-xs shadow-xl font-['Courier_Prime',monospace]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B4432F] animate-pulse" />
              <span>{isPlayingAudio ? `Musik: ${songTitle}` : 'Musik dijeda'}</span>
            </div>
          )}

          <button
            onClick={toggleAudio}
            className={`w-11 h-11 rounded-full border border-[#F2E9D8]/30 flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#1F2A3C] text-[#F2E9D8] ring-4 ring-[#B4432F]/30'
                : 'bg-[#1F2A3C]/85 text-[#F2E9D8]/60 hover:text-white'
            }`}
            title={isPlayingAudio ? 'Jeda Musik' : 'Putar Musik'}
            aria-label="Kontrol musik latar"
          >
            {isPlayingAudio ? <Disc3 className="w-4 h-4 z-[60] anim-spin-vinyl" /> : <Disc className="w-4 h-4 opacity-60" />}
          </button>
        </div>
      )}

      {/* ===================== GATE / SAMPUL JURNAL ===================== */}
      <div id="gate" className={isGateOpened ? 'opened' : ''}>
        <div className="gate-card" id="openGateBtn" onClick={handleOpenGate}>
          <div className="gate-stamp mono">MULAI</div>
          <div className="gate-title">
            {brideName} &amp; {groomName}
          </div>
          {!hideGuestName && guestRecipient ? (
            <div className="gate-sub mono">Kepada Yth. {guestRecipient}</div>
          ) : (
            <div className="gate-sub mono">Atlas Perjalanan Pernikahan Kami</div>
          )}
          <div className="gate-cta mono">Buka Atlas</div>
        </div>
      </div>

      {/* Penghitung Titik + Progres Rute */}
      <div
        id="pointCounter"
        className={`mono ${showPointCounter ? 'show' : ''}`}
        style={{ ['--p' as any]: scrollProgress }}
      >
        {pointLabel}
      </div>

      {/* ===================== APP SHELL ===================== */}
      <div id="appShell">
        {/* ===================== ISI UNDANGAN (KIRI PADA MODE DESKTOP) ===================== */}
        <div id="mobileContent" ref={mobileContentRef}>
          {/* ===================== SECTION 1 — HERO / TITIK AWAL (STATIS) ===================== */}
          <section id="hero" data-section-type="static">
            <div className="bg-layer">
              <img
                className="js-parallax"
                src={heroCoverBg}
                alt={`${brideName} & ${groomName}`}
                referrerPolicy="no-referrer"
                data-photo-slot="hero_cover_bg"
                data-slot-type="static-background"
                data-pane-no="Titik 01"
                data-pane-title="Awal Perjalanan"
                data-pane-meta={eventDateFormatted}
              />
            </div>
            <div className="bg-scrim" />
            <div className="scroll-cue">
              Gulir untuk membuka
              <span />
            </div>
            <div className="hero-content">
              <div className="route" aria-hidden="true">
                <svg width="300" height="60" viewBox="0 0 300 60" fill="none">
                  <path
                    d="M10 50 Q150 -20 290 40"
                    stroke="#B4432F"
                    strokeWidth="1.4"
                    strokeDasharray="4 5"
                  />
                </svg>
                <i>&#9992;</i>
              </div>
              <div className="point-no mono">Titik 01 — Awal Perjalanan</div>
              <h1>
                {brideName}
                <span className="amp">&amp;</span>
                {groomName}
              </h1>
              <div className="hero-tag mono">Atlas Perjalanan Menuju Pernikahan Kami</div>
            </div>
          </section>

          {/* ===================== SECTION 2 — PROLOG PERJALANAN (STATIS) ===================== */}
          <section className="prolog" id="section-prolog" data-section-type="static">
            <img
              className="pane-source"
              data-pane-image={interludeBg}
              data-pane-no="Titik 02"
              data-pane-title="Prolog Perjalanan"
              data-pane-meta="Catatan, 2026"
              alt=""
            />
            <div className="wrap reveal">
              <div className="ornament" />
              <blockquote data-dynamic-field="custom:opening_quote">{quoteText}</blockquote>
              <cite>— {quoteSource}</cite>
            </div>
          </section>

          {/* ===================== SECTION 3 — DUA PENJELAJAH / MEMPELAI (DINAMIS) ===================== */}
          <section
            id="mempelai"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <img
              className="pane-source"
              data-pane-image={bridePortraitPhoto}
              data-pane-no="Titik 03"
              data-pane-title="Dua Penjelajah"
              data-pane-meta="Potret, 2026"
              alt=""
            />
            <div className="wrap">
              <div className="eyebrow reveal">Titik 03 — Dua Penjelajah</div>
              <div
                className="traveler-block reveal"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width - 0.5;
                  e.currentTarget.style.transform = `translateY(-2px) rotateZ(${(
                    x * 0.5
                  ).toFixed(2)}deg)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                }}
              >
                <div className="role mono">Mempelai Wanita</div>
                <h2 data-dynamic-field="bride_name">{brideFullName}</h2>
                <p className="parents">
                  Putri dari <b data-dynamic-field="bride_parents">{brideParents}</b>
                </p>
              </div>
              <div className="traveler-divider reveal">&amp;</div>
              <div
                className="traveler-block reveal"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width - 0.5;
                  e.currentTarget.style.transform = `translateY(-2px) rotateZ(${(
                    x * 0.5
                  ).toFixed(2)}deg)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                }}
              >
                <div className="role mono">Mempelai Pria</div>
                <h2 data-dynamic-field="groom_name">{groomFullName}</h2>
                <p className="parents">
                  Putra dari <b data-dynamic-field="groom_parents">{groomParents}</b>
                </p>
              </div>
            </div>
          </section>

          {/* ===================== SECTION 4 — INTERLUDE FOTO BESAR (STATIS) ===================== */}
          <section className="interlude" id="section-interlude" data-section-type="static">
            <img
              src={interludeBg}
              alt="Snapshot perjalanan"
              referrerPolicy="no-referrer"
              data-photo-slot="interlude_bg_1"
              data-slot-type="static-background"
              data-pane-no="Titik 04"
              data-pane-title="Snapshot Perjalanan"
              data-pane-meta="Koleksi Pribadi"
            />
            <div className="scrim" />
            <div className="caption mono">Snapshot — Koleksi Pribadi</div>
          </section>

          {/* ===================== SECTION 5 — TIKET & KOORDINAT / WAKTU & TEMPAT (DINAMIS) ===================== */}
          <section id="waktu" data-section-type="dynamic" data-invitation-type="pernikahan">
            <img
              className="pane-source"
              data-pane-image={groomPortraitPhoto}
              data-pane-no="Titik 05"
              data-pane-title="Tiket & Koordinat"
              data-pane-meta="Jadwal, 2026"
              alt=""
            />
            <div className="wrap">
              <div className="eyebrow reveal">Titik 04 — Tiket &amp; Koordinat</div>
              <div className="ticket-row reveal">
                <div className="num mono">01</div>
                <div>
                  <h3>Akad Nikah</h3>
                  <p className="meta">
                    Diselenggarakan pada{' '}
                    <b data-dynamic-field="akad_schedule">
                      {eventDateFormatted} &middot; {akadTime}
                    </b>
                  </p>
                </div>
              </div>
              <div className="ticket-row reveal">
                <div className="num mono">02</div>
                <div>
                  <h3>Resepsi</h3>
                  <p className="meta">
                    Diselenggarakan pada{' '}
                    <b data-dynamic-field="resepsi_schedule">
                      {eventDateFormatted} &middot; {resepsiTime}
                    </b>
                  </p>
                </div>
              </div>
              <div className="ticket-row reveal">
                <div className="num mono">03</div>
                <div>
                  <h3>Lokasi</h3>
                  <p className="meta" data-dynamic-field="event_location">
                    {fullLocation}
                  </p>
                </div>
              </div>
              <div className="ticket-row reveal" style={{ borderBottom: 'none' }}>
                <div className="num mono">04</div>
                <div>
                  <h3>Tanggal Acara</h3>
                  <p className="meta" data-dynamic-field="event_date">
                    {eventDateFormatted}
                  </p>
                </div>
              </div>

              <div className="boarding reveal" aria-label="Hitung mundur keberangkatan">
                <div className="bp-cell">
                  <b data-cd="d">{cd.days}</b>
                  <span>Hari</span>
                </div>
                <div className="bp-cell">
                  <b data-cd="h">{cd.hours}</b>
                  <span>Jam</span>
                </div>
                <div className="bp-cell">
                  <b data-cd="m">{cd.mins}</b>
                  <span>Menit</span>
                </div>
                <div className="bp-cell">
                  <b data-cd="s">{cd.secs}</b>
                  <span>Detik</span>
                </div>
              </div>

              <button
                className={`cal-btn reveal ${calSaved ? 'done' : ''}`}
                id="addCal"
                type="button"
                onClick={handleSaveCalendarIcs}
              >
                {calSaved ? 'Tersimpan ✓' : 'Simpan ke Kalender'}
              </button>
            </div>
          </section>

          {/* ===================== SECTION 6 — ITINERARY / RANGKAIAN ACARA (DINAMIS) ===================== */}
          <section
            id="itinerary"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <img
              className="pane-source"
              data-pane-image={galleryPhotos[4]}
              data-pane-no="Titik 06"
              data-pane-title="Itinerary"
              data-pane-meta="Rangkaian acara, 2026"
              alt=""
            />
            <div className="wrap">
              <div className="eyebrow reveal">Titik 05 — Itinerary</div>
              <div className="mono sub reveal">Rangkaian Acara</div>
              <div data-dynamic-list="custom:rundown" data-list-source="customer">
                {DEFAULT_ITINERARY.map((item, idx) => (
                  <div key={idx} className="trail-item reveal">
                    <div className="dot" />
                    <div>
                      <div className="date mono">{item.time}</div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== SECTION 7 — PETA LOKASI (DINAMIS) ===================== */}
          <section
            id="lokasi"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <img
              className="pane-source"
              data-pane-image={galleryPhotos[5]}
              data-pane-no="Titik 07"
              data-pane-title="Peta Lokasi"
              data-pane-meta="Koordinat, 2026"
              alt=""
            />
            <div className="wrap">
              <div className="eyebrow reveal">Titik 06 — Peta Lokasi</div>
              <svg
                className="atlas-map reveal"
                viewBox="0 0 300 200"
                role="img"
                aria-label="Peta sederhana menuju lokasi acara"
              >
                <g className="contours" transform="rotate(-18 190 80)">
                  <ellipse cx="190" cy="80" rx="120" ry="70" />
                  <ellipse cx="190" cy="80" rx="90" ry="52" />
                  <ellipse cx="190" cy="80" rx="60" ry="34" />
                  <ellipse cx="190" cy="80" rx="30" ry="16" />
                </g>
                <path
                  className="route-line"
                  d="M20 180 C80 170 90 120 140 118 S180 96 190 80"
                />
                <circle cx="20" cy="180" r="3" fill="#1F2A3C" />
                <text className="map-txt" x="28" y="184">
                  Mulai
                </text>
                <circle className="map-ring" cx="190" cy="80" r="6" />
                <circle className="map-pin" cx="190" cy="80" r="4" />
                <text className="map-txt" x="198" y="70">
                  Lokasi acara
                </text>
                <path d="M268 40l6-14 6 14z" fill="#B4432F" />
                <text className="map-txt" x="274" y="54" textAnchor="middle">
                  U
                </text>
              </svg>
              <p
                className="serif reveal"
                style={{ fontSize: '1.1rem', fontStyle: 'italic' }}
                data-dynamic-field="event_location"
              >
                {fullLocation}
              </p>
              <a
                className="maps-btn reveal"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-dynamic-field="custom:maps_link"
              >
                Buka di Google Maps
              </a>
              <p className="loc-note reveal" data-dynamic-field="custom:parking_note">
                Area parkir tersedia di lokasi. Mohon tiba 15 menit sebelum acara dimulai.
              </p>
            </div>
          </section>

          {/* ===================== SECTION 8 — JEJAK PERJALANAN / KISAH CINTA (DINAMIS) ===================== */}
          <section id="kisah" data-section-type="dynamic" data-invitation-type="pernikahan">
            <img
              className="pane-source"
              data-pane-image={galleryPhotos[6]}
              data-pane-no="Titik 08"
              data-pane-title="Jejak Perjalanan"
              data-pane-meta="Rangkaian, 2018–2026"
              alt=""
            />
            <div className="wrap">
              <div className="eyebrow reveal">Titik 05 — Jejak Perjalanan</div>
              <div
                className="mono"
                style={{
                  fontSize: '0.64rem',
                  color: 'var(--ink-soft)',
                  marginBottom: '26px'
                }}
              >
                Kisah Cinta Kami
              </div>
              <div data-dynamic-list="our_story" data-list-source="customer">
                {storyTrails.map((st, idx) => (
                  <div key={idx} className="trail-item reveal">
                    <div className="dot" />
                    <div>
                      <div className="date mono">{st.date}</div>
                      <h4>{st.title}</h4>
                      <p>{st.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== SECTION 9 — DIVIDER KOMPAS (STATIS) ===================== */}
          <section
            className="compass-divider"
            id="section-compass"
            data-section-type="static"
          >
            <img
              className="pane-source"
              data-pane-image={galleryPhotos[7]}
              data-pane-no="Titik 09"
              data-pane-title="Jeda"
              data-pane-meta="Interlude, 2026"
              alt=""
            />
            <svg
              viewBox="0 0 44 44"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="#B4432F"
              strokeWidth="1.2"
            >
              <circle cx="22" cy="22" r="18" />
              <path d="M22 6 L26 20 L22 22 L18 20 Z" fill="#B4432F" stroke="none" />
              <path d="M22 38 L18 24 L22 22 L26 24 Z" />
              <circle cx="22" cy="22" r="2" fill="#1F2A3C" stroke="none" />
            </svg>
          </section>

          {/* ===================== SECTION 10 — KARTU POS / GALERI (DINAMIS) ===================== */}
          <section
            id="galeri"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <div className="head wrap reveal">
              <div className="eyebrow">Titik 07 — Kartu Pos</div>
              <h2
                className="serif"
                style={{ fontSize: 'clamp(1.65rem,6vw,2.1rem)', fontStyle: 'italic' }}
              >
                Galeri Kami
              </h2>
            </div>

            <div className="plate-grid">
              {[
                { idx: 0, cls: 'tall', no: '01' },
                { idx: 1, cls: 'wide', no: '02' },
                { idx: 2, cls: 'wide', no: '03' },
                { idx: 3, cls: 'tall', no: '04' },
                { idx: 4, cls: 'tall', no: '05' },
                { idx: 5, cls: 'wide', no: '06' }
              ].map((item) => (
                <figure key={item.no} className={`${item.cls} reveal-scale`}>
                  <img
                    src={galleryPhotos[item.idx]}
                    alt={`Kartu Pos ${item.no}`}
                    referrerPolicy="no-referrer"
                    data-photo-slot={`gallery_plate_${item.no}`}
                    data-slot-type="dynamic-gallery"
                    data-pane-no="Titik 10"
                    data-pane-title={`Kartu Pos — ${item.no}`}
                    data-pane-meta="Fotografi, 2026"
                  />
                  <figcaption>{item.no}</figcaption>
                </figure>
              ))}
            </div>

            <div className="carousel-wrap reveal">
              <div className="carousel-head">
                <div
                  className="mono"
                  style={{ fontSize: '0.62rem', color: 'var(--ink-soft)' }}
                >
                  Geser untuk melihat lebih banyak
                </div>
                <div className="carousel-nav">
                  <button
                    type="button"
                    id="carPrev"
                    aria-label="Sebelumnya"
                    onClick={() => scrollCarousel(-1)}
                  >
                    &#8592;
                  </button>
                  <button
                    type="button"
                    id="carNext"
                    aria-label="Berikutnya"
                    onClick={() => scrollCarousel(1)}
                  >
                    &#8594;
                  </button>
                </div>
              </div>
              <div className="carousel-track" id="carTrack" ref={carTrackRef}>
                {[
                  { idx: 6, no: '07' },
                  { idx: 7, no: '08' },
                  { idx: 8, no: '09' },
                  { idx: 9, no: '10' }
                ].map((item) => (
                  <figure key={item.no}>
                    <img
                      src={galleryPhotos[item.idx]}
                      alt={`Kartu Pos ${item.no}`}
                      referrerPolicy="no-referrer"
                      data-photo-slot={`gallery_plate_${item.no}`}
                      data-slot-type="dynamic-gallery"
                      data-pane-no="Titik 10"
                      data-pane-title={`Kartu Pos — ${item.no}`}
                      data-pane-meta="Fotografi, 2026"
                    />
                    <figcaption>{item.no}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="carousel-dots" id="carDots">
                {[0, 1, 2, 3].map((dotIdx) => (
                  <i
                    key={dotIdx}
                    className={activeCarouselDot === dotIdx ? 'active' : ''}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ===================== SECTION 11 — PARALLAX BAND / PEMANDANGAN (STATIS) ===================== */}
          <section
            className="parallax-band"
            id="section-parallax"
            data-section-type="static"
          >
            <img
              className="js-parallax"
              src={parallaxBg}
              alt="Pemandangan perjalanan"
              referrerPolicy="no-referrer"
              data-photo-slot="parallax_bg"
              data-slot-type="static-background"
              data-pane-no="Titik 11"
              data-pane-title="Peta Hati"
              data-pane-meta="Pemandangan, 2026"
            />
            <div className="band-scrim">
              <div className="band-text">
                &ldquo;Setiap langkah, tercatat dalam peta hati.&rdquo;
              </div>
            </div>
          </section>

          {/* ===================== SECTION 12 — KODE BERPAKAIAN (DINAMIS) ===================== */}
          <section
            id="dresscode"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <img
              className="pane-source"
              data-pane-image={bridePortraitPhoto}
              data-pane-no="Titik 12"
              data-pane-title="Kode Berpakaian"
              data-pane-meta="Palet, 2026"
              alt=""
            />
            <div className="wrap">
              <div className="eyebrow reveal">Titik 09 — Kode Berpakaian</div>
              <p className="dress-note reveal" data-dynamic-field="custom:dresscode_note">
                Untuk perjalanan ini, kami mengundang Anda berbusana dalam palet warna bumi berikut.
              </p>
              <div
                className="dress-row"
                data-dynamic-list="custom:dresscode_colors"
                data-list-source="customer"
              >
                {dresscodeSwatches.map((sw, idx) => (
                  <div key={idx} className="dress-sw reveal">
                    <div className="dress-chip" style={{ background: sw.hex }} />
                    <div className="dress-name">{sw.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== SECTION 13 — OLEH-OLEH & KADO / HADIAH (DINAMIS) ===================== */}
          <section
            id="hadiah"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <img
              className="pane-source"
              data-pane-image={groomPortraitPhoto}
              data-pane-no="Titik 13"
              data-pane-title="Oleh-oleh & Kado"
              data-pane-meta="Informasi, 2026"
              alt=""
            />
            <div className="wrap reveal">
              <div className="eyebrow" style={{ justifyContent: 'center' }}>
                Titik 08 — Oleh-oleh &amp; Kado
              </div>
              <h2
                className="serif"
                style={{ fontSize: 'clamp(1.5rem,6vw,1.85rem)', fontStyle: 'italic' }}
              >
                Amplop Digital
              </h2>
              <div className="gift-card">
                <div className="seal">✦</div>
                <p data-dynamic-field="gift_info">
                  Doa restu Anda adalah oleh-oleh terindah bagi kami. Namun jika Anda ingin memberi tanda kasih, kami dengan senang hati menerimanya melalui rekening{' '}
                  <b>
                    {bankName} {accountNumber}
                  </b>{' '}
                  a.n. <b>{accountHolder}</b>, atau amplop di tempat resepsi.
                </p>

                <button
                  type="button"
                  onClick={() => copyText(accountNumber.replace(/\s+/g, ''), 'atlas-bank-1')}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-[#1F2A3C] text-[#1F2A3C] hover:bg-[#1F2A3C] hover:text-[#F2E9D8] rounded text-xs font-['Courier_Prime',monospace] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isCopied('atlas-bank-1') ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#B4432F]" />
                      <span>Nomor Rekening Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Rekening {bankName}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ===================== SECTION 14 — POTRET PERJALANAN / FULL PLATE (STATIS) ===================== */}
          <section className="full-plate" id="section-fullplate" data-section-type="static">
            <span className="tag mono">Titik 09 — Potret Perjalanan</span>
            <img
              src={fullPlatePhoto}
              alt="Potret perjalanan"
              referrerPolicy="no-referrer"
              data-photo-slot="dynamic_cover_display"
              data-slot-type="dynamic-cover"
              data-pane-no="Titik 14"
              data-pane-title="Potret Perjalanan"
              data-pane-meta="Fotografi, 2026"
            />
          </section>

          {/* ===================== SECTION 15 — BUKU PERJALANAN / GUESTBOOK (DINAMIS) ===================== */}
          <section
            id="guestbook"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <img
              className="pane-source"
              data-pane-image={heroCoverBg}
              data-pane-no="Titik 15"
              data-pane-title="Buku Perjalanan"
              data-pane-meta="Kontribusi tamu, 2026"
              alt=""
            />
            <div className="wrap">
              <div className="eyebrow reveal">Titik 10 — Buku Perjalanan</div>
              <h2 className="reveal">Ucapan &amp; Doa</h2>
              <div
                className="wish-list"
                id="wishList"
                data-dynamic-list="guest_wishes"
                data-list-source="guest"
              >
                {wishes.map((w, idx) => (
                  <div key={idx} className="wish-card reveal is-visible">
                    <div className="who mono">{w.name}</div>
                    <div className="msg">{w.message}</div>
                  </div>
                ))}
              </div>
              <form
                className="guest-form reveal"
                id="guestForm"
                onSubmit={handleGuestbookSubmit}
              >
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={attendanceInput}
                    onChange={(e) =>
                      setAttendanceInput(
                        e.target.value as 'hadir' | 'ragu' | 'tidak_hadir'
                      )
                    }
                  >
                    <option value="hadir">Hadir</option>
                    <option value="ragu">Masih Ragu</option>
                    <option value="tidak_hadir">Berhalangan</option>
                  </select>
                  <select
                    value={guestCountInput}
                    onChange={(e) => setGuestCountInput(Number(e.target.value))}
                  >
                    <option value={1}>1 Orang</option>
                    <option value={2}>2 Orang</option>
                    <option value={3}>3 Orang</option>
                    <option value={4}>4 Orang</option>
                  </select>
                </div>
                <textarea
                  placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  required
                />
                <button type="submit">Kirim Ucapan</button>
                <div className="form-note">
                  Ucapan Anda akan tampil di daftar setelah dikirim.
                </div>
              </form>
            </div>
          </section>

          {/* ===================== SECTION 16 — TITIK AKHIR (STATIS) ===================== */}
          <section id="footer-static" data-section-type="static">
            <div className="bg-layer">
              <img
                src={footerClosingBg}
                alt="Penutup perjalanan"
                referrerPolicy="no-referrer"
                data-photo-slot="footer_closing_bg"
                data-slot-type="static-background"
                data-pane-no="Titik 16"
                data-pane-title="Titik Akhir, Awal Baru"
                data-pane-meta="Penutup, 2026"
              />
            </div>
            <div className="scrim" />
            <div className="content reveal">
              <div className="ornament" />
              <div className="eyebrow" style={{ justifyContent: 'center' }}>
                Titik 11 — Titik Akhir, Awal Baru
              </div>
              <h2 data-dynamic-field="custom:closing_message">
                Terima kasih telah menjadi bagian dari perjalanan ini.
              </h2>
              <p>Kehadiran &amp; doa Anda adalah bekal paling berharga bagi kami</p>
              <div className="end-mark">
                — Atlas Cinta &middot; {brideName} &amp; {groomName} &middot; Sekarsiti —
              </div>
            </div>
          </section>
        </div>
        {/* /#mobileContent */}

        {/* PANEL KANAN DESKTOP (#deskPane) — Floating Card di Kanan */}
        <div id="deskPane" aria-hidden="true">
          <img
            className={`pane-img ${activePaneIdx === 0 ? 'active' : ''}`}
            src={paneLayers[0]}
            alt=""
            referrerPolicy="no-referrer"
          />
          <img
            className={`pane-img ${activePaneIdx === 1 ? 'active' : ''}`}
            src={paneLayers[1]}
            alt=""
            referrerPolicy="no-referrer"
          />
          <div className="pane-scrim" />
          <div className="corner-tag mono">
            Atlas Cinta — {brideName} &amp; {groomName}
          </div>
          <div className={`pane-postcard ${postcardInfo.show ? 'show' : ''}`}>
            <div className="p-no">{postcardInfo.no}</div>
            <div className="p-title">{postcardInfo.title}</div>
            <div className="p-meta">{postcardInfo.meta}</div>
          </div>
        </div>
      </div>
      {/* /#appShell */}
    </div>
  );
};
