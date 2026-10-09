import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Disc3, Disc } from 'lucide-react';
import { ClientInvitationData } from '../types/clientInvitation';
import {
  useCountdown,
  useGuestRecipient,
  useAudioController,
  useClipboardCopy,
  useGuestbook
} from '../hooks/useInvitationCore';
import { AdminStore } from '../admin/adminStore';

interface CetakBiruTemplateProps {
  onBackToLanding: () => void;
  onOrderViaWhatsApp: () => void;
  customData?: ClientInvitationData;
}

const DEFAULT_GALLERY_PHOTOS = [
  'src/assets/images/blueprint_couple_hero_1791171076790.jpg',
  'src/assets/images/blueprint_couple_candid_1791171089791.jpg',
  'src/assets/images/blueprint_venue_detail_1791171101186.jpg',
  'src/assets/images/blueprint_groom_portrait_1791171047935.jpg',
  'src/assets/images/blueprint_bride_portrait_1791171064118.jpg',
  'src/assets/images/editorial_couple_portrait_1790838636662.jpg',
  'src/assets/images/wedding_vows_bouquet_1790901516667.jpg',
  'src/assets/images/editorial_venue_rings_1790838653826.jpg',
  'src/assets/images/botanical_estate_venue_1790919022237.jpg',
  'src/assets/images/wedding_dance_lights_1790901533590.jpg'
];

const REGISTRATION_MARKS = [
  { left: '12%', top: '16%', delay: '-1.2s' },
  { left: '78%', top: '14%', delay: '-4.5s' },
  { left: '24%', top: '38%', delay: '-2.8s' },
  { left: '84%', top: '42%', delay: '-6.1s' },
  { left: '15%', top: '62%', delay: '-3.4s' },
  { left: '68%', top: '28%', delay: '-7.3s' },
  { left: '48%', top: '18%', delay: '-5.0s' },
  { left: '74%', top: '58%', delay: '-8.2s' }
];

const RUNDOWN_ITEMS = [
  {
    time: '07.30',
    title: 'Registrasi tamu',
    description: 'Tamu undangan mengisi daftar hadir.'
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
    description: 'Terima kasih telah hadir dan mendoakan.'
  }
];

const DRESSCODE_SWATCHES = [
  { hex: '#164b73', name: 'Biru tinta' },
  { hex: '#f1ecdd', name: 'Krem kertas' },
  { hex: '#c9903f', name: 'Kuningan' },
  { hex: '#9fd3ec', name: 'Biru langit' }
];

export const CetakBiruTemplate: React.FC<CetakBiruTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData
}) => {
  // Data Mempelai & Acara (Custom atau Default Cetak Biru: Raka & Ayunda)
  const groomName = customData?.groomName || 'Raka Pradipta';
  const groomFullName = customData?.groomFullName || 'Raka Pradipta Wijaya';
  const groomParents = customData?.groomParents || 'Bapak Hendra Wijaya & Ibu Sulastri';
  const groomInstagram = customData?.groomInstagram || '@rakapradipta';

  const brideName = customData?.brideName || 'Ayunda Kirana';
  const brideFullName = customData?.brideFullName || 'Ayunda Kirana Putri';
  const brideParents = customData?.brideParents || 'Bapak Yoga Prasetyo & Ibu Ratna Dewi';
  const brideInstagram = customData?.brideInstagram || '@ayundakirana';

  const eventDateFormatted = customData?.eventDateFormatted || 'Sabtu, 14 November 2026';
  const countdownIsoDate = customData?.countdownIsoDate || '2026-11-14T08:00:00+07:00';
  const akadTime = customData?.akadTime || '08.00 – 09.30 WIB';
  const resepsiTime = customData?.resepsiTime || '11.00 – 14.00 WIB';
  const resepsiVenue = customData?.resepsiVenue || 'Gedung Serba Guna Wastu Kencana';
  const city = customData?.city || 'Bandung';
  const fullLocation = customData?.resepsiVenue
    ? `${resepsiVenue}, ${city}`
    : 'Gedung Serba Guna Wastu Kencana, Bandung';
  const mapsUrl =
    customData?.mapsUrl ||
    'https://www.google.com/maps/search/?api=1&query=Gedung+Wastu+Kencana+Bandung';

  const quoteText =
    customData?.quoteText ||
    '"Setiap bangunan yang kokoh dimulai dari satu garis sederhana. Punya kami dimulai dari satu percakapan panjang yang tak pernah selesai."';
  const quoteSource = customData?.quoteSource || 'Catatan Arsitek, 2026';

  const bankName = customData?.bankName || 'BCA';
  const accountNumber = customData?.accountNumber || '1280 5566 990';
  const accountHolder = customData?.accountHolder || 'Ayunda Kirana Putri';
  const songTitle = customData?.songTitle || 'Blueprint Acoustic Strings - Instrumental';

  // Media Slots
  const rawGallery =
    customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages.length > 0
      ? customData.mediaSlots.galleryImages
      : DEFAULT_GALLERY_PHOTOS;

  // Ensure up to 10 gallery photos for the blueprint documentation grid
  const galleryPhotos = Array.from({ length: Math.max(rawGallery.length, 6) }, (_, idx) => {
    return rawGallery[idx % rawGallery.length];
  }).slice(0, 10);

  const heroCoverPhoto =
    customData?.mediaSlots?.heroImage ||
    'src/assets/images/blueprint_couple_hero_1791171076790.jpg';
  const groomPortraitPhoto =
    customData?.mediaSlots?.groomPortrait ||
    'src/assets/images/blueprint_groom_portrait_1791171047935.jpg';
  const bridePortraitPhoto =
    customData?.mediaSlots?.bridePortrait ||
    'src/assets/images/blueprint_bride_portrait_1791171064118.jpg';
  const gateBgPhoto =
    customData?.mediaSlots?.heroImage ||
    'src/assets/images/blueprint_couple_candid_1791171089791.jpg';
  const fullbleed1Photo =
    (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages[0]) ||
    '/src/assets/images/blueprint_couple_candid_1791171089791.jpg';
  const elevation1Photo =
    (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages[1]) ||
    '/src/assets/images/blueprint_venue_detail_1791171101186.jpg';
  const elevation2Photo =
    (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages[2]) ||
    '/src/assets/images/botanical_estate_venue_1790919022237.jpg';
  const closingBgPhoto =
    (customData?.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages[3]) ||
    '/src/assets/images/blueprint_couple_hero_1791171076790.jpg';

  const photoSlotMap: Record<string, string> = {
    'couple-cover': heroCoverPhoto,
    'groom-portrait': groomPortraitPhoto,
    'bride-portrait': bridePortraitPhoto,
    'gate-bp': gateBgPhoto,
    'fullbleed-1': fullbleed1Photo,
    'elevation-1': elevation1Photo,
    'elevation-2': elevation2Photo,
    'gallery-1': galleryPhotos[0],
    'closing-bp': closingBgPhoto
  };

  // Hooks
  const { guestName: guestRecipient, hideGuestName } = useGuestRecipient(
    'Bpk. Hendra Wijaya & Keluarga'
  );
  const { isPlayingAudio, showAudioToast, toggleAudio, startAudio } =
    useAudioController(songTitle);
  const { copyText, isCopied } = useClipboardCopy(1800);
  const cd = useCountdown(countdownIsoDate);

  // State
  const [isGateClosed, setIsGateClosed] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [calSaved, setCalSaved] = useState(false);

  // Dual dynamic desktop panels crossfade state
  const [leftLayers, setLeftLayers] = useState<[string, string]>([heroCoverPhoto, heroCoverPhoto]);
  const [activeLeftIdx, setActiveLeftIdx] = useState<0 | 1>(0);
  const [rightLayers, setRightLayers] = useState<[string, string]>([heroCoverPhoto, heroCoverPhoto]);
  const [activeRightIdx, setActiveRightIdx] = useState<0 | 1>(0);

  // Dimension line scroll progress state
  const panelRef = useRef<HTMLElement>(null);
  const vinePathRef = useRef<SVGPathElement>(null);
  const [vineLength, setVineLength] = useState(3000);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Lightbox state
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [customLightbox, setCustomLightbox] = useState<{ src: string; alt: string } | null>(null);
  const touchStartXRef = useRef<number>(0);

  // Guestbook & RSVP
  const initialWishes =
    customData?.guestbookEntries && customData.guestbookEntries.length > 0
      ? customData.guestbookEntries
      : [
          {
            name: 'Dinda Anggraini',
            message:
              'Selamat menempuh hidup baru Raka & Ayunda! Semoga fondasinya kuat sampai kakek nenek. 🤍'
          },
          {
            name: 'Ars. Bima Pratama & Partner',
            message:
              'Selamat atas peresmian cetak biru kehidupan bersama! Semoga selalu kokoh, teduh, dan penuh berkah.'
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

  // Format short date for titleblock (e.g. 14.11.2026)
  const parsedDateObj = new Date(countdownIsoDate);
  const shortDateDot = !isNaN(parsedDateObj.getTime())
    ? `${String(parsedDateObj.getDate()).padStart(2, '0')}.${String(
        parsedDateObj.getMonth() + 1
      ).padStart(2, '0')}.${parsedDateObj.getFullYear()}`
    : '14.11.2026';
  const shortDateTwoDigit = !isNaN(parsedDateObj.getTime())
    ? `${String(parsedDateObj.getDate()).padStart(2, '0')}.${String(
        parsedDateObj.getMonth() + 1
      ).padStart(2, '0')}.${String(parsedDateObj.getFullYear()).slice(-2)}`
    : '14.11.26';

  // Measure SVG vinePath length on mount
  useEffect(() => {
    if (vinePathRef.current) {
      try {
        const len = vinePathRef.current.getTotalLength();
        if (len > 0) setVineLength(len);
      } catch {
        setVineLength(3030);
      }
    }
  }, []);

  // Scroll listener for Dimension Line & Meter Readout
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleScroll = () => {
      const max = panel.scrollHeight - panel.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, panel.scrollTop / max)) : 0;
      setScrollProgress(p);
    };

    panel.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => panel.removeEventListener('scroll', handleScroll);
  }, [isGateClosed]);

  // IntersectionObserver for .reveal, .story__path/.rundown__list, and [data-panel-source]
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    // 1. Reveal observer (excluding #section-hero .reveal before gate opens)
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: panel, threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    panel.querySelectorAll('.reveal').forEach((el) => {
      if (el.closest('#section-hero')) return;
      revealObserver.observe(el);
    });

    // 2. Timeline draw observer
    const drawObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
            drawObserver.unobserve(entry.target);
          }
        });
      },
      { root: panel, threshold: 0.12 }
    );

    panel.querySelectorAll('.story__path, .rundown__list').forEach((el) => {
      drawObserver.observe(el);
    });

    // 3. Dual Panel Image observer
    const panelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const leftSlot = entry.target.getAttribute('data-panel-source');
            const rightSlot = entry.target.getAttribute('data-panel-source-right') || leftSlot;

            if (leftSlot && photoSlotMap[leftSlot]) {
              const nextLeftUrl = photoSlotMap[leftSlot];
              setActiveLeftIdx((prev) => {
                const nextIdx = prev === 0 ? 1 : 0;
                setLeftLayers((layers) => {
                  const updated: [string, string] = [...layers] as [string, string];
                  updated[nextIdx] = nextLeftUrl;
                  return updated;
                });
                return nextIdx;
              });
            }

            if (rightSlot && photoSlotMap[rightSlot]) {
              const nextRightUrl = photoSlotMap[rightSlot];
              setActiveRightIdx((prev) => {
                const nextIdx = prev === 0 ? 1 : 0;
                setRightLayers((layers) => {
                  const updated: [string, string] = [...layers] as [string, string];
                  updated[nextIdx] = nextRightUrl;
                  return updated;
                });
                return nextIdx;
              });
            }
          }
        });
      },
      { root: panel, threshold: 0.45 }
    );

    panel.querySelectorAll('[data-panel-source]').forEach((el) => {
      panelObserver.observe(el);
    });

    return () => {
      revealObserver.disconnect();
      drawObserver.disconnect();
      panelObserver.disconnect();
    };
  }, [
    heroCoverPhoto,
    groomPortraitPhoto,
    bridePortraitPhoto,
    gateBgPhoto,
    fullbleed1Photo,
    elevation1Photo,
    elevation2Photo,
    closingBgPhoto
  ]);

  const handleOpenGate = () => {
    setIsGateClosed(true);
    startAudio();
    setTimeout(() => {
      setHeroRevealed(true);
    }, 350);
  };

  const handleSaveCalendarIcs = () => {
    const cleanSummary = `Pernikahan ${groomName} & ${brideName}`;
    const cleanLocation = fullLocation.replace(/,/g, '\\,');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sekarsiti Undangan Digital//ID',
      'BEGIN:VEVENT',
      `UID:pernikahan-${Date.now()}@sekarsiti`,
      'DTSTAMP:20261001T000000Z',
      'DTSTART:20261114T010000Z',
      'DTEND:20261114T070000Z',
      `SUMMARY:${cleanSummary}`,
      `LOCATION:${cleanLocation}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `pernikahan-${groomName.toLowerCase().replace(/\s+/g, '-')}-${brideName
      .toLowerCase()
      .replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setCalSaved(true);
    setTimeout(() => setCalSaved(false), 1800);
  };

  const handleGuestbookFormSubmit = (e: React.FormEvent) => {
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

  const stepLightbox = (delta: number) => {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx + delta + galleryPhotos.length) % galleryPhotos.length);
  };

  // Ruler fill widths
  const dNum = parseInt(cd.days, 10) || 0;
  const hNum = parseInt(cd.hours, 10) || 0;
  const mNum = parseInt(cd.mins, 10) || 0;
  const sNum = parseInt(cd.secs, 10) || 0;

  const fillD = `${Math.min(dNum / 365, 1) * 100}%`;
  const fillH = `${(hNum / 24) * 100}%`;
  const fillM = `${(mNum / 60) * 100}%`;
  const fillS = `${(sNum / 60) * 100}%`;

  return (
    <div className="cetak-biru-root relative min-h-screen">
      <style>{`
        .cetak-biru-root {
          --blue-deep: #0c3654;
          --blue: #164b73;
          --blue-mid: #1f5c89;
          --cyan-line: #9fd3ec;
          --cyan-soft: #cbe8f7;
          --paper: #f1ecdd;
          --paper-dim: #e2d9c2;
          --ink: #12233a;
          --brass: #c9903f;
          --brass-soft: #e0b876;
          --ease: cubic-bezier(.22,.68,.28,1);
          --grid-left: 1.35fr;
          --grid-right: 0.78fr;
          --frame-w: 440px;
          font-family: 'IBM Plex Sans', sans-serif;
          background: var(--blue-deep);
          color: var(--paper);
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }
        .cetak-biru-root h1,
        .cetak-biru-root h2,
        .cetak-biru-root h3,
        .cetak-biru-root .display {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          margin: 0;
        }
        .cetak-biru-root .hand {
          font-family: 'Kalam', cursive;
          font-weight: 400;
        }
        .cetak-biru-root img {
          display: block;
          max-width: 100%;
        }
        .cetak-biru-root button {
          font-family: inherit;
          cursor: pointer;
        }

        /* ===================== APP SHELL — grid 3 zona (desktop) ===================== */
        .cetak-biru-root .app-shell {
          display: grid;
          grid-template-columns: var(--grid-left) var(--frame-w) var(--grid-right);
          width: 100%;
          height: 100vh;
          height: 100dvh;
          padding-top: 44px;
          background: var(--blue-deep);
        }

        .cetak-biru-root .panel-image {
          position: relative;
          overflow: hidden;
          background: var(--blue);
        }
        .cetak-biru-root .panel-image__layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: scale(1.05);
          transition: opacity 1.1s var(--ease), transform 7s linear;
        }
        .cetak-biru-root .panel-image__layer.is-active {
          opacity: 1;
          transform: scale(1);
        }
        .cetak-biru-root .panel-image--left .panel-image__layer {
          filter: sepia(.15) hue-rotate(160deg) saturate(1.3) brightness(.7);
        }
        .cetak-biru-root .panel-image--right .panel-image__layer {
          filter: sepia(.15) hue-rotate(160deg) saturate(1.3) brightness(.55);
          transform: scaleX(-1) scale(1.05);
        }
        .cetak-biru-root .panel-image--right .panel-image__layer.is-active {
          transform: scaleX(-1) scale(1);
        }
        .cetak-biru-root .panel-image__veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(12,54,84,.25), rgba(12,54,84,.75));
          mix-blend-mode: multiply;
          pointer-events: none;
        }
        .cetak-biru-root .panel-image__grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(159,211,236,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(159,211,236,.14) 1px, transparent 1px);
          background-size: 36px 36px;
          mix-blend-mode: screen;
          opacity: .5;
        }
        .cetak-biru-root .panel-image__corner {
          position: absolute;
          width: 26px;
          height: 26px;
          border: 1.5px solid var(--cyan-soft);
          opacity: .7;
        }
        .cetak-biru-root .panel-image__corner--tl {
          top: 24px;
          left: 24px;
          border-right: none;
          border-bottom: none;
        }
        .cetak-biru-root .panel-image__corner--br {
          bottom: 24px;
          right: 24px;
          border-left: none;
          border-top: none;
        }
        .cetak-biru-root .panel-image__label {
          position: absolute;
          left: 30px;
          bottom: 30px;
          z-index: 2;
          font-family: 'Kalam', cursive;
          font-size: 1.2rem;
          color: var(--cyan-soft);
          opacity: .85;
        }
        .cetak-biru-root .panel-image__label small {
          display: block;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: .62rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--brass-soft);
          margin-bottom: 6px;
        }
        .cetak-biru-root .panel-image--right .panel-image__label {
          left: auto;
          right: 20px;
          text-align: right;
        }

        .cetak-biru-root .panel-invitation {
          position: relative;
          height: 100%;
          overflow-x: hidden;
          scroll-behavior: smooth;
          background: var(--blue-deep);
          color: var(--paper);
          box-shadow: 0 0 0 1px rgba(159,211,236,.15), 0 30px 80px rgba(0,0,0,.5);
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .cetak-biru-root .panel-invitation::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 899px) {
          .cetak-biru-root .app-shell {
            display: block;
          }
          .cetak-biru-root .panel-image {
            display: none;
          }
          .cetak-biru-root .panel-invitation {
            width: 100%;
            height: calc(100vh - 44px);
            height: calc(100dvh - 44px);
            box-shadow: none;
          }
        }

        /* ===================== DIMENSION LINE — signature scroll element ===================== */
        .cetak-biru-root .dimline {
          position: sticky;
          top: 0;
          left: auto;
          margin-left: 6px;
          width: 30px;
          height: calc(100vh - 44px);
          height: calc(100dvh - 44px);
          margin-bottom: calc(-100vh + 44px);
          margin-bottom: calc(-100dvh + 44px);
          pointer-events: none;
          z-index: 3;
        }
        .cetak-biru-root .dimline svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }
        .cetak-biru-root .dimline path {
          fill: none;
          stroke: var(--brass-soft);
          stroke-width: 1.2;
        }
        .cetak-biru-root .dimline__readout {
          position: absolute;
          top: auto;
          bottom: 16px;
          left: 4px;
          margin: 0;
          writing-mode: vertical-rl;
          padding: 7px 3px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: .58rem;
          letter-spacing: .08em;
          color: var(--brass-soft);
          background: rgba(12,54,84,.85);
          border: 1px solid rgba(201,144,63,.4);
          border-radius: 2px;
          width: max-content;
        }

        /* ===================== SECTION BASE ===================== */
        .cetak-biru-root section {
          position: relative;
          padding: 96px 32px 84px 46px;
          overflow: hidden;
          z-index: 2;
        }
        .cetak-biru-root .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: .64rem;
          letter-spacing: .26em;
          text-transform: uppercase;
          color: var(--brass-soft);
          margin-bottom: 18px;
        }
        .cetak-biru-root .section-tag::before {
          content: "§";
          font-family: 'Space Grotesk', sans-serif;
          color: var(--brass);
        }
        .cetak-biru-root .section-tag::after {
          content: "";
          width: 0;
          height: 1px;
          background: var(--brass);
          transition: width 1s var(--ease) .3s;
        }
        .cetak-biru-root .section-tag.is-visible::after {
          width: 40px;
        }
        .cetak-biru-root .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .85s var(--ease), transform .85s var(--ease);
        }
        .cetak-biru-root .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .cetak-biru-root h1.reveal,
        .cetak-biru-root h2.reveal {
          clip-path: inset(-6px 100% -6px -6px);
          transform: none;
          transition: clip-path 1.1s var(--ease), opacity .4s var(--ease);
        }
        .cetak-biru-root h1.reveal.is-visible,
        .cetak-biru-root h2.reveal.is-visible {
          clip-path: inset(-6px -6px -6px -6px);
        }
        .cetak-biru-root .reveal-delay-1.is-visible { transition-delay: .1s; }
        .cetak-biru-root .reveal-delay-2.is-visible { transition-delay: .2s; }
        .cetak-biru-root .reveal-delay-3.is-visible { transition-delay: .3s; }

        /* ===================== TITLE BLOCK ===================== */
        .cetak-biru-root .titleblock {
          border: 1px solid var(--cyan-line);
          border-radius: 2px;
          padding: 0;
          overflow: hidden;
          font-size: .6rem;
        }
        .cetak-biru-root .titleblock__row {
          display: flex;
          border-bottom: 1px solid rgba(159,211,236,.3);
        }
        .cetak-biru-root .titleblock__row:last-child { border-bottom: none; }
        .cetak-biru-root .titleblock__cell {
          flex: 1;
          padding: 8px 10px;
          border-right: 1px solid rgba(159,211,236,.3);
        }
        .cetak-biru-root .titleblock__cell:last-child { border-right: none; }
        .cetak-biru-root .titleblock__label {
          display: block;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--brass-soft);
          margin-bottom: 3px;
          font-size: .56rem;
        }
        .cetak-biru-root .titleblock__val {
          color: var(--cyan-soft);
          font-family: 'Space Grotesk', sans-serif;
          font-size: .72rem;
        }

        /* ===================== GATE / SAMPUL ===================== */
        .cetak-biru-root .gate {
          position: absolute;
          inset: 0;
          z-index: 60;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 36px 26px;
          background: linear-gradient(180deg, rgba(12,54,84,.55), rgba(12,54,84,.94));
          transition: opacity 1s var(--ease), visibility 1s;
        }
        .cetak-biru-root .gate__bg {
          position: absolute;
          inset: 0;
          z-index: -2;
          background-size: cover;
          background-position: center;
          filter: sepia(.2) hue-rotate(160deg) saturate(1.2) brightness(.4);
        }
        .cetak-biru-root .gate__grid {
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image: linear-gradient(rgba(159,211,236,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(159,211,236,.12) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .cetak-biru-root .gate.is-closed {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .cetak-biru-root .gate__plan {
          width: 124px;
          margin-bottom: 20px;
        }
        .cetak-biru-root .gate__plan path {
          stroke: var(--brass-soft);
          stroke-width: 1.2;
          stroke-linecap: round;
          fill: none;
          stroke-dasharray: 1;
          animation: cbDraw 2s var(--ease) both;
        }
        .cetak-biru-root .gate__plan path + path {
          animation-delay: 1.2s;
        }
        @keyframes cbDraw {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
        .cetak-biru-root .gate__eyebrow {
          letter-spacing: .3em;
          text-transform: uppercase;
          font-size: .62rem;
          color: var(--brass-soft);
          margin-bottom: 14px;
          animation: cbGateIn .9s var(--ease) .5s both;
        }
        .cetak-biru-root .gate__project {
          font-size: .68rem;
          color: var(--cyan-soft);
          letter-spacing: .05em;
          margin-bottom: 22px;
          font-family: 'Space Grotesk', sans-serif;
          animation: cbGateIn .9s var(--ease) .7s both;
        }
        .cetak-biru-root .gate__names {
          font-size: 2.15rem;
          line-height: 1.25;
          animation: cbGateIn .9s var(--ease) .95s both;
        }
        .cetak-biru-root .gate__amp {
          display: block;
          font-family: 'Kalam', cursive;
          color: var(--brass-soft);
          font-size: 1.5rem;
          margin: 6px 0;
        }
        .cetak-biru-root .gate__titleblock {
          margin-top: 26px;
          width: 100%;
          max-width: 280px;
          animation: cbGateIn .9s var(--ease) 1.25s both;
        }
        .cetak-biru-root .gate__btn {
          margin-top: 28px;
          border: 1px solid var(--brass-soft);
          background: transparent;
          color: var(--brass-soft);
          padding: 13px 30px;
          border-radius: 2px;
          letter-spacing: .14em;
          text-transform: uppercase;
          font-size: .68rem;
          position: relative;
          transition: background .35s var(--ease), color .35s var(--ease);
          animation: cbGateIn .9s var(--ease) 1.5s both;
        }
        .cetak-biru-root .gate__btn:hover {
          background: var(--brass-soft);
          color: var(--ink);
        }
        .cetak-biru-root .gate__btn::after {
          content: "";
          position: absolute;
          inset: -6px;
          border: 1px solid var(--brass-soft);
          opacity: 0;
          animation: cbRing 2.6s ease-out 2.6s infinite;
        }
        @keyframes cbGateIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes cbRing {
          from { opacity: .6; transform: scale(1); }
          to { opacity: 0; transform: scale(1.22); }
        }

        /* ===================== HERO ===================== */
        .cetak-biru-root .hero {
          min-height: calc(100vh - 44px);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 56px;
          padding-left: 32px;
        }
        .cetak-biru-root .hero__cover-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .cetak-biru-root .hero__cover-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(.9);
          animation: cbKb 22s ease-in-out infinite alternate;
          transform-origin: 60% 40%;
        }
        @keyframes cbKb {
          from { transform: scale(1); }
          to { transform: scale(1.09); }
        }
        .cetak-biru-root .hero__scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(12,54,84,.25) 0%, rgba(12,54,84,.4) 45%, var(--blue-deep) 100%);
        }
        .cetak-biru-root .hero__grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(159,211,236,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(159,211,236,.08) 1px, transparent 1px);
          background-size: 34px 34px;
        }
        .cetak-biru-root .mark {
          position: absolute;
          z-index: 1;
          pointer-events: none;
          font: normal 16px 'Space Grotesk', sans-serif;
          color: var(--cyan-soft);
          opacity: .3;
          animation: cbDrift 9s ease-in-out infinite;
        }
        @keyframes cbDrift {
          0%, 100% { transform: translateY(0) rotate(0); opacity: .15; }
          50% { transform: translateY(-18px) rotate(90deg); opacity: .55; }
        }
        .cetak-biru-root .hero__content {
          position: relative;
          z-index: 2;
        }
        .cetak-biru-root .hero__eyebrow {
          letter-spacing: .3em;
          text-transform: uppercase;
          font-size: .64rem;
          color: var(--brass-soft);
          margin-bottom: 16px;
        }
        .cetak-biru-root .hero__names {
          font-size: 2.5rem;
          line-height: 1.22;
        }
        .cetak-biru-root .hero__amp {
          font-family: 'Kalam', cursive;
          color: var(--cyan-soft);
          display: block;
          font-size: 1.4rem;
          margin: 6px 0;
        }
        .cetak-biru-root .hero__meta {
          margin-top: 18px;
          font-size: .78rem;
          color: var(--cyan-soft);
          letter-spacing: .04em;
          font-family: 'Space Grotesk', sans-serif;
        }
        .cetak-biru-root .hero__scrollcue {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: .6rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--brass-soft);
        }
        .cetak-biru-root .hero__scrollcue .dash {
          width: 24px;
          height: 1px;
          background: var(--brass-soft);
          animation: cbDashPulse 1.8s ease-in-out infinite;
        }
        @keyframes cbDashPulse {
          0%, 100% { transform: scaleX(1); opacity: .6; }
          50% { transform: scaleX(1.6); opacity: 1; }
        }

        /* ===================== QUOTE ===================== */
        .cetak-biru-root .quote { text-align: left; }
        .cetak-biru-root .quote__badge {
          width: 44px;
          height: 44px;
          border: 1.5px solid var(--brass-soft);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .cetak-biru-root .quote__badge svg {
          width: 20px;
          height: 20px;
          stroke: var(--brass-soft);
        }
        .cetak-biru-root .quote__text {
          font-family: 'Kalam', cursive;
          font-size: 1.5rem;
          line-height: 1.5;
          color: var(--cyan-soft);
          transform: rotate(-1deg);
          max-width: 300px;
        }
        .cetak-biru-root .quote__sig {
          margin-top: 18px;
          font-size: .64rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--paper-dim);
        }

        /* ===================== COUPLE / MEMPELAI ===================== */
        .cetak-biru-root .couple__title { font-size: 1.85rem; margin-bottom: 8px; }
        .cetak-biru-root .couple__sub { font-size: .82rem; color: var(--paper-dim); margin-bottom: 32px; line-height: 1.6; }
        .cetak-biru-root .couple__card {
          background: var(--blue);
          border: 1px solid rgba(159,211,236,.25);
          padding: 24px 22px;
          margin-bottom: 20px;
          position: relative;
        }
        .cetak-biru-root .couple__tag {
          position: absolute;
          top: -1px;
          right: -1px;
          background: var(--brass);
          color: var(--ink);
          font-size: .56rem;
          letter-spacing: .1em;
          padding: 3px 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
        }
        .cetak-biru-root .couple__role {
          font-size: .6rem;
          letter-spacing: .24em;
          text-transform: uppercase;
          color: var(--cyan-soft);
          margin-bottom: 10px;
        }
        .cetak-biru-root .couple__name { font-size: 1.35rem; margin-bottom: 10px; }
        .cetak-biru-root .couple__parents { font-size: .82rem; color: var(--paper-dim); line-height: 1.6; }
        .cetak-biru-root .couple__parents b { color: var(--cyan-soft); font-weight: 500; }
        .cetak-biru-root .couple__and {
          text-align: center;
          font-family: 'Kalam', cursive;
          font-size: 1.3rem;
          color: var(--brass-soft);
          margin: 2px 0 20px;
        }

        /* ===================== COUPLE PORTRAITS (SECTION TAMBAHAN) ===================== */
        .cetak-biru-root .couple-portraits {
          background: var(--blue);
          border-top: 1px dashed rgba(159,211,236,.28);
          border-bottom: 1px dashed rgba(159,211,236,.28);
        }
        .cetak-biru-root .couple-portraits__title {
          font-size: 1.85rem;
          margin-bottom: 8px;
        }
        .cetak-biru-root .couple-portraits__sub {
          font-size: .82rem;
          color: var(--paper-dim);
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .cetak-biru-root .couple-portrait-card {
          position: relative;
          background: var(--blue-deep);
          border: 1px solid rgba(159,211,236,.32);
          padding: 32px 14px 14px;
        }
        .cetak-biru-root .couple-portrait-card__dim {
          position: absolute;
          top: 6px;
          left: 14px;
          right: 14px;
          height: 20px;
          display: flex;
          align-items: center;
        }
        .cetak-biru-root .couple-portrait-card__dim::before,
        .cetak-biru-root .couple-portrait-card__dim::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--cyan-line);
          opacity: .55;
        }
        .cetak-biru-root .couple-portrait-card__dim span {
          font-size: .55rem;
          letter-spacing: .16em;
          color: var(--cyan-soft);
          padding: 0 8px;
          white-space: nowrap;
          font-family: 'Space Grotesk', sans-serif;
        }
        .cetak-biru-root .couple-portrait-card__frame {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
          border: 1px solid rgba(224,184,118,.45);
          cursor: pointer;
          background: var(--blue);
        }
        .cetak-biru-root .couple-portrait-card__frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(.88) contrast(1.03);
          transition: transform .6s var(--ease);
        }
        .cetak-biru-root .couple-portrait-card__frame:hover img {
          transform: scale(1.04);
        }
        .cetak-biru-root .couple-portrait-card__frame .fb-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(159,211,236,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(159,211,236,.12) 1px, transparent 1px);
          background-size: 28px 28px;
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .cetak-biru-root .couple-portrait-card__badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--brass);
          color: var(--ink);
          font-size: .56rem;
          letter-spacing: .12em;
          padding: 3px 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
        }
        .cetak-biru-root .couple-portrait-card__scale {
          position: absolute;
          bottom: 10px;
          right: 12px;
          background: rgba(12,54,84,.82);
          border: 1px solid rgba(159,211,236,.35);
          color: var(--cyan-soft);
          font-size: .54rem;
          letter-spacing: .14em;
          padding: 2px 7px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .cetak-biru-root .couple-portrait-card__titleblock {
          margin-top: 12px;
        }
        .cetak-biru-root .couple-portraits__axis {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 22px 0;
          color: var(--brass-soft);
          font-family: 'Space Grotesk', sans-serif;
        }
        .cetak-biru-root .couple-portraits__axis-line {
          flex: 1;
          height: 1px;
          border-top: 1px dashed rgba(224,184,118,.45);
        }
        .cetak-biru-root .couple-portraits__axis-node {
          font-size: .75rem;
          line-height: 1;
          color: var(--cyan-soft);
        }
        .cetak-biru-root .couple-portraits__axis-label {
          font-size: .56rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--brass-soft);
        }
        .cetak-biru-root .couple-portraits__note {
          margin-top: 22px;
          font-family: 'Kalam', cursive;
          font-size: 1.05rem;
          color: var(--cyan-soft);
          line-height: 1.55;
          text-align: center;
          transform: rotate(-1deg);
        }

        /* ===================== FULLBLEED IMAGE ===================== */
        .cetak-biru-root .fullbleed { padding: 0; }
        .cetak-biru-root .fullbleed--one { height: 76vh; position: relative; }
        .cetak-biru-root .fullbleed--one img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.85); }
        .cetak-biru-root .fullbleed--one .fb-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(159,211,236,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(159,211,236,.1) 1px, transparent 1px);
          background-size: 32px 32px;
          mix-blend-mode: screen;
        }
        .cetak-biru-root .fb-corner {
          position: absolute;
          width: 22px;
          height: 22px;
          border-color: var(--brass-soft);
        }
        .cetak-biru-root .fb-corner--tl { top: 18px; left: 18px; border-top: 1.5px solid; border-left: 1.5px solid; }
        .cetak-biru-root .fb-corner--tr { top: 18px; right: 18px; border-top: 1.5px solid; border-right: 1.5px solid; }
        .cetak-biru-root .fb-corner--bl { bottom: 18px; left: 18px; border-bottom: 1.5px solid; border-left: 1.5px solid; }
        .cetak-biru-root .fb-corner--br { bottom: 18px; right: 18px; border-bottom: 1.5px solid; border-right: 1.5px solid; }
        .cetak-biru-root .fullbleed__caption {
          position: absolute;
          bottom: 32px;
          left: 32px;
          right: 32px;
          font-family: 'Kalam', cursive;
          font-size: 1.05rem;
          color: var(--cyan-soft);
          text-shadow: 0 2px 10px rgba(0,0,0,.6);
        }

        .cetak-biru-root .fullbleed--elevation {
          display: flex;
          gap: 2px;
          background: var(--blue-deep);
        }
        .cetak-biru-root .elevation {
          flex: 1;
          position: relative;
          padding-top: 34px;
          overflow: hidden;
        }
        .cetak-biru-root .elevation__dim {
          position: absolute;
          top: 0;
          left: 8px;
          right: 8px;
          height: 24px;
          display: flex;
          align-items: center;
        }
        .cetak-biru-root .elevation__dim::before,
        .cetak-biru-root .elevation__dim::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--cyan-line);
          opacity: .6;
        }
        .cetak-biru-root .elevation__dim span {
          font-size: .56rem;
          color: var(--cyan-soft);
          padding: 0 6px;
          white-space: nowrap;
          font-family: 'Space Grotesk', sans-serif;
        }
        .cetak-biru-root .elevation img {
          width: 100%;
          height: 44vh;
          object-fit: cover;
          filter: saturate(.85);
        }

        /* ===================== EVENT / WAKTU & TEMPAT ===================== */
        .cetak-biru-root .event { background: var(--blue); }
        .cetak-biru-root .event__title { font-size: 1.85rem; margin-bottom: 28px; }
        .cetak-biru-root .event__row {
          display: flex;
          gap: 14px;
          padding: 18px 0;
          border-bottom: 1px dashed rgba(159,211,236,.3);
        }
        .cetak-biru-root .event__row:first-of-type {
          border-top: 1px dashed rgba(159,211,236,.3);
        }
        .cetak-biru-root .event__icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          border: 1px solid var(--brass-soft);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cetak-biru-root .event__icon svg {
          width: 16px;
          height: 16px;
          stroke: var(--brass-soft);
        }
        .cetak-biru-root .event__label {
          font-size: .6rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--brass-soft);
          margin-bottom: 4px;
        }
        .cetak-biru-root .event__value {
          font-size: .95rem;
          line-height: 1.5;
          color: var(--paper);
        }
        .cetak-biru-root .event__schedules {
          display: flex;
          gap: 12px;
          margin-top: 26px;
        }
        .cetak-biru-root .event__sched-card {
          flex: 1;
          background: rgba(159,211,236,.06);
          border: 1px solid rgba(159,211,236,.25);
          padding: 16px 12px;
          text-align: center;
        }
        .cetak-biru-root .event__sched-card b {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.05rem;
          margin-top: 6px;
          color: var(--cyan-soft);
        }

        /* Countdown = pita ukur (ruler strip) */
        .cetak-biru-root .countdown { margin-top: 30px; }
        .cetak-biru-root .countdown__row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .cetak-biru-root .countdown__label {
          width: 52px;
          flex: 0 0 52px;
          font-size: .62rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--brass-soft);
        }
        .cetak-biru-root .countdown__ruler {
          flex: 1;
          height: 8px;
          background: repeating-linear-gradient(90deg, rgba(159,211,236,.25) 0 1px, transparent 1px 8px);
          position: relative;
          overflow: hidden;
        }
        .cetak-biru-root .countdown__fill {
          position: absolute;
          inset: 0;
          background: var(--brass-soft);
          transition: width 1s linear;
        }
        .cetak-biru-root .countdown__num {
          width: 38px;
          flex: 0 0 38px;
          text-align: right;
          font-family: 'Space Grotesk', sans-serif;
          font-size: .85rem;
          color: var(--cyan-soft);
        }
        .cetak-biru-root .cal-btn { margin-top: 26px; }

        /* ===================== RUNDOWN & OUR STORY ===================== */
        .cetak-biru-root .rundown__title,
        .cetak-biru-root .venue__title,
        .cetak-biru-root .dress__title,
        .cetak-biru-root .story__title {
          font-size: 1.85rem;
          margin-bottom: 8px;
        }
        .cetak-biru-root .story__title { margin-bottom: 30px; }
        .cetak-biru-root .story__path {
          position: relative;
          padding-left: 20px;
        }
        .cetak-biru-root .story__path::before,
        .cetak-biru-root .rundown__list::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: repeating-linear-gradient(180deg, var(--cyan-line) 0 6px, transparent 6px 10px);
          opacity: .6;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 1.8s var(--ease);
        }
        .cetak-biru-root .story__path::before { left: -1px; }
        .cetak-biru-root .story__path.is-drawn::before,
        .cetak-biru-root .rundown__list.is-drawn::before {
          transform: scaleY(1);
        }
        .cetak-biru-root .rundown__list {
          position: relative;
          margin-top: 30px;
        }
        .cetak-biru-root .rundown__list::before {
          left: 61px;
          top: 6px;
          bottom: 26px;
        }
        .cetak-biru-root .rundown__item {
          display: flex;
          gap: 28px;
          padding-bottom: 28px;
          position: relative;
        }
        .cetak-biru-root .rundown__item::before {
          content: "";
          position: absolute;
          left: 57px;
          top: 6px;
          width: 9px;
          height: 9px;
          background: var(--brass);
          transform: rotate(45deg);
        }
        .cetak-biru-root .rundown__time {
          flex: 0 0 46px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: .92rem;
          color: var(--brass-soft);
        }
        .cetak-biru-root .rundown__name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.05rem;
          margin-bottom: 4px;
        }
        .cetak-biru-root .rundown__desc {
          font-size: .82rem;
          color: var(--paper-dim);
          line-height: 1.55;
        }

        /* Lokasi & Denah */
        .cetak-biru-root .venue { background: var(--blue); }
        .cetak-biru-root .venue__plan {
          width: 100%;
          height: auto;
          margin: 26px 0 20px;
          border: 1px solid rgba(159,211,236,.3);
          background: var(--blue-deep);
        }
        .cetak-biru-root .plan-road {
          stroke: var(--cyan-line);
          stroke-opacity: .45;
          stroke-dasharray: 4 4;
          fill: none;
        }
        .cetak-biru-root .plan-bld {
          fill: rgba(201,144,63,.12);
          stroke: var(--brass-soft);
          stroke-width: 1.2;
        }
        .cetak-biru-root .plan-pin { fill: var(--brass); }
        .cetak-biru-root .plan-ring {
          fill: none;
          stroke: var(--brass-soft);
          transform-box: fill-box;
          transform-origin: center;
          animation: cbPinPulse 2.4s ease-out infinite;
        }
        @keyframes cbPinPulse {
          from { transform: scale(.5); opacity: .9; }
          to { transform: scale(3); opacity: 0; }
        }
        .cetak-biru-root .plan-txt {
          font: 9px 'IBM Plex Sans', sans-serif;
          fill: var(--cyan-soft);
        }
        .cetak-biru-root .venue__btn {
          display: block;
          text-align: center;
          margin-top: 18px;
          border: 1px solid var(--brass-soft);
          color: var(--brass-soft);
          padding: 12px;
          font-size: .68rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background .3s var(--ease), color .3s var(--ease);
        }
        .cetak-biru-root .venue__btn:hover {
          background: var(--brass-soft);
          color: var(--ink);
        }
        .cetak-biru-root .venue__note {
          font-size: .8rem;
          color: var(--paper-dim);
          line-height: 1.6;
          margin-top: 16px;
        }

        /* Our Story Items */
        .cetak-biru-root .story__item {
          position: relative;
          margin-bottom: 30px;
          padding-left: 20px;
        }
        .cetak-biru-root .story__rev {
          position: absolute;
          left: -30px;
          top: -2px;
          width: 22px;
          height: 16px;
          background: var(--brass);
          color: var(--ink);
          font-size: .55rem;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cetak-biru-root .story__date {
          font-size: .62rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--cyan-soft);
          margin-bottom: 6px;
        }
        .cetak-biru-root .story__item-title { font-size: 1.15rem; margin-bottom: 6px; }
        .cetak-biru-root .story__desc { font-size: .84rem; color: var(--paper-dim); line-height: 1.6; }
        .cetak-biru-root .story__photo {
          margin-top: 12px;
          width: 100%;
          max-width: 220px;
          border: 1px solid var(--brass-soft);
        }
        .cetak-biru-root .story__photo img {
          width: 100%;
          height: 130px;
          object-fit: cover;
          filter: saturate(.85);
        }

        /* ===================== GALERI ===================== */
        .cetak-biru-root .gallery__title { font-size: 1.85rem; }
        .cetak-biru-root .gallery__hint { font-size: .74rem; color: var(--paper-dim); margin-top: 8px; }
        .cetak-biru-root .gallery__grid {
          margin-top: 32px;
          column-count: 2;
          column-gap: 10px;
        }
        .cetak-biru-root .print-thumb {
          position: relative;
          margin-bottom: 10px;
          break-inside: avoid;
          border: 1px solid rgba(159,211,236,.3);
          cursor: pointer;
          overflow: hidden;
          background: var(--blue);
        }
        .cetak-biru-root .print-thumb img {
          width: 100%;
          display: block;
          filter: saturate(.85);
          transition: transform .5s var(--ease);
        }
        .cetak-biru-root .print-thumb:hover img { transform: scale(1.06); }
        .cetak-biru-root .print-thumb__peel {
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 22px 22px;
          border-color: transparent transparent var(--paper) transparent;
          transition: border-width .3s var(--ease);
        }
        .cetak-biru-root .print-thumb:hover .print-thumb__peel {
          border-width: 0 0 32px 32px;
        }
        .cetak-biru-root .print-thumb__tag {
          position: absolute;
          bottom: 6px;
          left: 6px;
          font-size: .56rem;
          font-family: 'Space Grotesk', sans-serif;
          color: var(--cyan-soft);
          background: rgba(12,54,84,.75);
          padding: 2px 5px;
          letter-spacing: .05em;
        }

        /* Lightbox */
        .cetak-biru-root .lightbox {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(12,54,84,.96);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity .4s var(--ease), visibility .4s;
        }
        .cetak-biru-root .lightbox.is-open {
          opacity: 1;
          visibility: visible;
        }
        .cetak-biru-root .lightbox__stage {
          width: 88%;
          max-width: 420px;
          aspect-ratio: 3/4;
          position: relative;
          border: 2px solid var(--cyan-soft);
          transform: scale(.94);
          transition: transform .4s var(--ease);
        }
        .cetak-biru-root .lightbox.is-open .lightbox__stage {
          transform: scale(1);
        }
        .cetak-biru-root .lightbox__stage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cetak-biru-root .lightbox__stage .fb-corner {
          width: 16px;
          height: 16px;
        }
        .cetak-biru-root .lightbox__close,
        .cetak-biru-root .lightbox__prev,
        .cetak-biru-root .lightbox__next {
          position: absolute;
          background: rgba(12,54,84,.85);
          border: 1px solid var(--brass-soft);
          color: var(--brass-soft);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cetak-biru-root .lightbox__close { top: 24px; right: 24px; }
        .cetak-biru-root .lightbox__prev { left: 16px; top: 50%; transform: translateY(-50%); }
        .cetak-biru-root .lightbox__next { right: 16px; top: 50%; transform: translateY(-50%); }

        /* Dresscode */
        .cetak-biru-root .dress { border-top: 1px dashed rgba(159,211,236,.25); }
        .cetak-biru-root .dress__note { font-size: .84rem; color: var(--paper-dim); line-height: 1.6; margin: 0; }
        .cetak-biru-root .dress__swatches { display: flex; gap: 10px; margin-top: 26px; }
        .cetak-biru-root .dress__sw { flex: 1; }
        .cetak-biru-root .dress__chip { height: 92px; border: 1px solid rgba(159,211,236,.35); margin-bottom: 8px; }
        .cetak-biru-root .dress__name { font-size: .72rem; color: var(--paper-dim); line-height: 1.4; }

        /* ===================== GIFT / AMPLOP ===================== */
        .cetak-biru-root .gift { background: var(--blue); }
        .cetak-biru-root .gift__title { font-size: 1.75rem; margin-bottom: 12px; }
        .cetak-biru-root .gift__desc { font-size: .84rem; color: var(--paper-dim); max-width: 290px; margin: 0 0 24px; line-height: 1.6; }
        .cetak-biru-root .gift__card {
          border: 1px dashed var(--brass-soft);
          padding: 22px;
          position: relative;
          margin-bottom: 16px;
        }
        .cetak-biru-root .gift__reqno {
          position: absolute;
          top: -11px;
          left: 16px;
          background: var(--blue);
          padding: 0 8px;
          font-size: .58rem;
          letter-spacing: .14em;
          color: var(--brass-soft);
          font-family: 'Space Grotesk', sans-serif;
        }
        .cetak-biru-root .gift__bank {
          font-size: .62rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--brass-soft);
        }
        .cetak-biru-root .gift__number {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.3rem;
          margin: 8px 0;
          color: var(--cyan-soft);
        }
        .cetak-biru-root .gift__owner { font-size: .8rem; color: var(--paper-dim); }
        .cetak-biru-root .gift__copybtn {
          margin-top: 16px;
          width: 100%;
          border: 1px solid var(--brass-soft);
          background: transparent;
          color: var(--brass-soft);
          padding: 12px;
          font-size: .68rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          transition: background .3s var(--ease), color .3s var(--ease);
        }
        .cetak-biru-root .gift__copybtn:hover {
          background: var(--brass-soft);
          color: var(--ink);
        }
        .cetak-biru-root .gift__copybtn.is-copied {
          background: var(--cyan-soft);
          color: var(--ink);
          border-color: var(--cyan-soft);
        }
        .cetak-biru-root .gift__note {
          margin-top: 20px;
          font-size: .78rem;
          color: var(--paper-dim);
          line-height: 1.6;
        }

        /* ===================== GUESTBOOK ===================== */
        .cetak-biru-root .guestbook__title { font-size: 1.85rem; margin-bottom: 8px; }
        .cetak-biru-root .guestbook__sub { font-size: .82rem; color: var(--paper-dim); margin-bottom: 26px; }
        .cetak-biru-root .guestbook__form {
          background: var(--blue);
          border: 1px solid rgba(159,211,236,.25);
          padding: 20px;
          margin-bottom: 28px;
        }
        .cetak-biru-root .guestbook__field { margin-bottom: 13px; }
        .cetak-biru-root .guestbook__field label {
          display: block;
          font-size: .6rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--brass-soft);
          margin-bottom: 6px;
        }
        .cetak-biru-root .guestbook__field input,
        .cetak-biru-root .guestbook__field select,
        .cetak-biru-root .guestbook__field textarea {
          width: 100%;
          border: 1px solid rgba(159,211,236,.3);
          background: var(--blue-deep);
          color: var(--paper);
          padding: 10px 12px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: .88rem;
          resize: vertical;
        }
        .cetak-biru-root .guestbook__field input:focus,
        .cetak-biru-root .guestbook__field select:focus,
        .cetak-biru-root .guestbook__field textarea:focus {
          outline: 2px solid var(--brass-soft);
          outline-offset: 1px;
        }
        .cetak-biru-root .guestbook__submit {
          width: 100%;
          background: var(--brass-soft);
          color: var(--ink);
          border: none;
          padding: 12px;
          letter-spacing: .14em;
          text-transform: uppercase;
          font-size: .68rem;
          font-weight: 600;
          transition: background .3s var(--ease), transform .15s var(--ease);
        }
        .cetak-biru-root .guestbook__submit:hover { background: var(--cyan-soft); }
        .cetak-biru-root .guestbook__submit:active { transform: scale(.97); }
        .cetak-biru-root .guestbook__list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .cetak-biru-root .guestbook__item {
          background: var(--paper);
          color: var(--ink);
          padding: 14px 16px 14px 20px;
          position: relative;
          border-left: 3px dashed var(--brass);
        }
        .cetak-biru-root .guestbook__item::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12px;
          width: 34px;
          height: 9px;
          background: rgba(201,144,63,.35);
        }
        .cetak-biru-root .guestbook__item-name {
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 4px;
        }
        .cetak-biru-root .guestbook__item-msg {
          font-size: .84rem;
          color: #33302a;
          line-height: 1.55;
        }

        /* ===================== CLOSING ===================== */
        .cetak-biru-root .closing {
          min-height: 64vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }
        .cetak-biru-root .closing__bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: .16;
          filter: sepia(.2) hue-rotate(160deg);
        }
        .cetak-biru-root .closing__grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(159,211,236,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(159,211,236,.08) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .cetak-biru-root .closing__content { position: relative; z-index: 2; }
        .cetak-biru-root .closing__quote {
          font-family: 'Kalam', cursive;
          font-size: 1.3rem;
          color: var(--cyan-soft);
          line-height: 1.6;
          max-width: 280px;
          margin-bottom: 24px;
          transform: rotate(-1deg);
        }
        .cetak-biru-root .closing__titleblock { max-width: 300px; }
        .cetak-biru-root .closing__credit {
          margin-top: 28px;
          font-size: .62rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--paper-dim);
          opacity: .55;
        }
      `}</style>

      {/* ============================================================
          TOP DEMO CONTROL BAR (Sticky Navigation for Sekarsiti)
          ============================================================ */}
      {!customData && (
        <header className="fixed top-0 left-0 right-0 z-70 bg-[#082438]/95 backdrop-blur-md border-b border-[#9fd3ec]/25 text-[#f1ecdd] px-4 sm:px-6 h-[44px] flex items-center justify-between text-xs">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-[#e0b876] hover:text-white transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Sekarsiti</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[#cbe8f7]/85">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9903f] animate-pulse" />
            <span className="font-['Space_Grotesk',sans-serif] text-xs tracking-wider uppercase text-[#f1ecdd]">
              Cetak Biru Kami · {groomName} &amp; {brideName}
            </span>
          </div>

          <button
            onClick={onOrderViaWhatsApp}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#c9903f] hover:bg-[#b57f32] text-[#12233a] font-semibold rounded-sm shadow-sm transition-all active:scale-95 cursor-pointer font-['Space_Grotesk',sans-serif]"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan Desain Ini</span>
          </button>
        </header>
      )}

      {/* Floating Audio Controller */}
      {isGateClosed && (
        <div className="fixed bottom-8 right-8 z-[75] flex items-center gap-3 pointer-events-auto">
          {showAudioToast && (
            <div className="hidden sm:flex items-center gap-2 py-1.5 px-3.5 bg-[#0c3654]/95 backdrop-blur-md border border-[#e0b876]/40 text-[#f1ecdd] rounded-sm text-xs shadow-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0b876] animate-pulse" />
              <span>{isPlayingAudio ? `Musik: ${songTitle}` : 'Musik dijeda'}</span>
            </div>
          )}

          <button
            onClick={toggleAudio}
            className={`w-11 h-11 rounded-full border border-[#e0b876] flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#0c3654] text-[#e0b876] ring-4 ring-[#9fd3ec]/20'
                : 'bg-[#0c3654]/80 text-[#f1ecdd]/60 hover:text-white'
            }`}
            title={isPlayingAudio ? 'Jeda Musik' : 'Putar Musik'}
            aria-label="Kontrol musik latar"
          >
            {isPlayingAudio ? <Disc3 className="w-5 h-5 text-[#e0b876] anim-spin-vinyl" /> : <Disc className="w-5 h-5 opacity-60" />}
          </button>
        </div>
      )}

      {/* ============================================================
          APP SHELL — 3 ZONA DESKTOP (LEFT PANEL, MOBILE FRAME, RIGHT PANEL)
          ============================================================ */}
      <div className="app-shell">
        {/* PANEL KIRI — dinamis, lebih lebar, desktop only */}
        <div className="panel-image panel-image--left" aria-hidden="true">
          <div
            className={`panel-image__layer ${activeLeftIdx === 0 ? 'is-active' : ''}`}
            style={{ backgroundImage: `url('${leftLayers[0]}')` }}
          />
          <div
            className={`panel-image__layer ${activeLeftIdx === 1 ? 'is-active' : ''}`}
            style={{ backgroundImage: `url('${leftLayers[1]}')` }}
          />
          <div className="panel-image__grid" />
          <div className="panel-image__veil" />
          <span className="panel-image__corner panel-image__corner--tl" />
          <span className="panel-image__corner panel-image__corner--br" />
          <div className="panel-image__label">
            <small>Lembar &mdash; A</small>
            {groomName.split(' ')[0]} &amp; {brideName.split(' ')[0]}
          </div>
        </div>

        {/* BINGKAI MOBILE — undangan (selalu lebar tetap di desktop) */}
        <main
          ref={panelRef}
          className="panel-invitation"
          id="panelInvitation"
          style={{ overflowY: isGateClosed ? 'auto' : 'hidden' }}
        >
          {/* Garis ukur (dimension line) yang tergambar mengikuti scroll */}
          <div className="dimline" aria-hidden="true">
            <div className="dimline__readout">
              {(scrollProgress * 14.11).toFixed(2)} m
            </div>
            <svg viewBox="0 0 30 3000" preserveAspectRatio="none">
              <path
                ref={vinePathRef}
                d="M15,0 V3000 M15,0 L6,10 M15,0 L24,10 M15,3000 L6,2990 M15,3000 L24,2990"
                style={{
                  strokeDasharray: vineLength,
                  strokeDashoffset: vineLength * (1 - scrollProgress)
                }}
              />
            </svg>
          </div>

          {/* ============================================================
              GATE / SAMPUL — dynamic
              ============================================================ */}
          <div
            className={`gate ${isGateClosed ? 'is-closed' : ''}`}
            id="gate"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <div
              className="gate__bg"
              style={{ backgroundImage: `url('${gateBgPhoto}')` }}
            />
            <div className="gate__grid" />
            <svg className="gate__plan" viewBox="0 0 120 84" aria-hidden="true">
              <path
                pathLength={1}
                d="M10 70H110M20 70V34L60 10L100 34V70M48 70V48H72V70M60 10V3"
              />
              <path pathLength={1} d="M10 77H110M10 74V80M110 74V80" />
            </svg>
            <div className="gate__eyebrow">Undangan Pernikahan</div>
            <div className="gate__project">
              Proyek No. 001 &mdash; Membangun Rumah Bersama
            </div>
            <div className="gate__names display">
              <span>{groomName}</span>
              <span className="gate__amp">&amp;</span>
              <span>{brideName}</span>
            </div>

            <div className="gate__titleblock titleblock">
              <div className="titleblock__row">
                <div className="titleblock__cell">
                  <span className="titleblock__label">Tanggal</span>
                  <span className="titleblock__val">{shortDateDot}</span>
                </div>
                <div className="titleblock__cell">
                  <span className="titleblock__label">Skala</span>
                  <span className="titleblock__val">1:1 Selamanya</span>
                </div>
              </div>
              {!hideGuestName && guestRecipient && (
                <div className="titleblock__row">
                  <div className="titleblock__cell">
                    <span className="titleblock__label">Kepada Yth.</span>
                    <span className="titleblock__val">{guestRecipient}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              className="gate__btn"
              id="openGate"
              type="button"
              onClick={handleOpenGate}
            >
              Buka Cetak Biru
            </button>
          </div>

          {/* ============================================================
              HERO — dynamic-cover
              ============================================================ */}
          <section
            className="hero"
            id="section-hero"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
            data-panel-source="couple-cover"
          >
            <div className="hero__cover-wrap">
              <img
                src={heroCoverPhoto}
                alt={`Foto sampul ${groomName} & ${brideName}`}
              />
            </div>
            <div className="hero__grid" />
            <div className="hero__scrim" />

            {/* Floating registration marks (+) */}
            {REGISTRATION_MARKS.map((mk, idx) => (
              <i
                key={idx}
                className="mark"
                aria-hidden="true"
                style={{
                  left: mk.left,
                  top: mk.top,
                  animationDelay: mk.delay
                }}
              >
                +
              </i>
            ))}

            <div className="hero__content">
              <div className={`hero__eyebrow reveal ${heroRevealed ? 'is-visible' : ''}`}>
                The Wedding Of
              </div>
              <h1
                className={`hero__names reveal reveal-delay-1 ${
                  heroRevealed ? 'is-visible' : ''
                }`}
              >
                <span>{groomName}</span>
                <span className="hero__amp">&amp;</span>
                <span>{brideName}</span>
              </h1>
              <div
                className={`hero__meta reveal reveal-delay-2 ${
                  heroRevealed ? 'is-visible' : ''
                }`}
              >
                {eventDateFormatted}
              </div>
              <div
                className={`hero__scrollcue reveal reveal-delay-3 ${
                  heroRevealed ? 'is-visible' : ''
                }`}
              >
                <span className="dash" /> Gulir untuk membaca cetak biru
              </div>
            </div>
          </section>

          {/* ============================================================
              QUOTE — statis (catatan margin arsitek)
              ============================================================ */}
          <section
            className="quote"
            id="section-quote"
            data-section-type="static"
            data-panel-source="gate-bp"
          >
            <div className="quote__badge reveal">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <p className="quote__text reveal reveal-delay-1">{quoteText}</p>
            <div className="quote__sig reveal reveal-delay-2">&mdash; {quoteSource}</div>
          </section>

          {/* ============================================================
              MEMPELAI — dynamic (spec sheet)
              ============================================================ */}
          <section
            className="couple"
            id="section-couple"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <div className="section-tag reveal">Mempelai</div>
            <h2 className="couple__title reveal reveal-delay-1">Dua Elemen Penopang</h2>
            <p className="couple__sub reveal reveal-delay-2">
              yang mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberi restu
            </p>

            <div className="couple__card reveal">
              <div className="couple__tag">ELM &mdash; 01</div>
              <div className="couple__role">Mempelai Pria</div>
              <div className="couple__name">{groomFullName}</div>
              <div className="couple__parents">
                Putra dari <b>{groomParents}</b>
              </div>
            </div>

            <div className="couple__and reveal">&amp;</div>

            <div className="couple__card reveal reveal-delay-1">
              <div className="couple__tag">ELM &mdash; 02</div>
              <div className="couple__role">Mempelai Wanita</div>
              <div className="couple__name">{brideFullName}</div>
              <div className="couple__parents">
                Putri dari <b>{brideParents}</b>
              </div>
            </div>
          </section>

          {/* ============================================================
              POTRET KEDUA MEMPELAI — section tambahan khusus foto mempelai
              ============================================================ */}
          <section
            className="couple-portraits"
            id="section-couple-portraits"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
            data-panel-source="groom-portrait"
            data-panel-source-right="bride-portrait"
          >
            <div className="section-tag reveal">Potret Mempelai</div>
            <h2 className="couple-portraits__title reveal reveal-delay-1">
              Tampak &amp; Profil Mempelai
            </h2>
            <p className="couple-portraits__sub reveal reveal-delay-2">
              Lembar dokumentasi visual kedua mempelai dalam skala 1:1.
            </p>

            {/* Lembar Potret 01 — Mempelai Pria */}
            <div className="couple-portrait-card reveal">
              <div className="couple-portrait-card__dim">
                <span>TAMPAK 01 &middot; MEMPELAI PRIA</span>
              </div>
              <div
                className="couple-portrait-card__frame"
                onClick={() =>
                  setCustomLightbox({
                    src: groomPortraitPhoto,
                    alt: `Potret ${groomFullName}`
                  })
                }
              >
                <img
                  src={groomPortraitPhoto}
                  alt={`Potret ${groomFullName}`}
                  referrerPolicy="no-referrer"
                />
                <div className="fb-grid" />
                <span className="fb-corner fb-corner--tl" />
                <span className="fb-corner fb-corner--tr" />
                <span className="fb-corner fb-corner--bl" />
                <span className="fb-corner fb-corner--br" />
                <span className="print-thumb__peel" />
                <span className="couple-portrait-card__badge">ELM &mdash; 01</span>
                <span className="couple-portrait-card__scale">SKALA 1:1</span>
              </div>
              <div className="couple-portrait-card__titleblock titleblock">
                <div className="titleblock__row">
                  <div className="titleblock__cell">
                    <span className="titleblock__label">Nama Lengkap</span>
                    <span className="titleblock__val">{groomFullName}</span>
                  </div>
                  <div className="titleblock__cell" style={{ flex: '0 0 112px' }}>
                    <span className="titleblock__label">Instagram</span>
                    <span className="titleblock__val">{groomInstagram}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Poros Penghubung Arsitektur */}
            <div className="couple-portraits__axis reveal" aria-hidden="true">
              <span className="couple-portraits__axis-line" />
              <span className="couple-portraits__axis-node">+</span>
              <span className="couple-portraits__axis-label">POROS UTAMA</span>
              <span className="couple-portraits__axis-node">+</span>
              <span className="couple-portraits__axis-line" />
            </div>

            {/* Lembar Potret 02 — Mempelai Wanita */}
            <div className="couple-portrait-card reveal reveal-delay-1">
              <div className="couple-portrait-card__dim">
                <span>TAMPAK 02 &middot; MEMPELAI WANITA</span>
              </div>
              <div
                className="couple-portrait-card__frame"
                onClick={() =>
                  setCustomLightbox({
                    src: bridePortraitPhoto,
                    alt: `Potret ${brideFullName}`
                  })
                }
              >
                <img
                  src={bridePortraitPhoto}
                  alt={`Potret ${brideFullName}`}
                  referrerPolicy="no-referrer"
                />
                <div className="fb-grid" />
                <span className="fb-corner fb-corner--tl" />
                <span className="fb-corner fb-corner--tr" />
                <span className="fb-corner fb-corner--bl" />
                <span className="fb-corner fb-corner--br" />
                <span className="print-thumb__peel" />
                <span className="couple-portrait-card__badge">ELM &mdash; 02</span>
                <span className="couple-portrait-card__scale">SKALA 1:1</span>
              </div>
              <div className="couple-portrait-card__titleblock titleblock">
                <div className="titleblock__row">
                  <div className="titleblock__cell">
                    <span className="titleblock__label">Nama Lengkap</span>
                    <span className="titleblock__val">{brideFullName}</span>
                  </div>
                  <div className="titleblock__cell" style={{ flex: '0 0 112px' }}>
                    <span className="titleblock__label">Instagram</span>
                    <span className="titleblock__val">{brideInstagram}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="couple-portraits__note reveal">
              &ldquo;Dua garis vertikal yang berdiri sejajar, menopang atap dan ruang yang sama.&rdquo;
            </div>
          </section>

          {/* ============================================================
              FULLBLEED 1 — statis
              ============================================================ */}
          <section
            className="fullbleed fullbleed--one"
            id="section-fullimage-1"
            data-section-type="static"
            data-panel-source="fullbleed-1"
          >
            <img src={fullbleed1Photo} alt="Momen kebersamaan" />
            <div className="fb-grid" />
            <span className="fb-corner fb-corner--tl" />
            <span className="fb-corner fb-corner--tr" />
            <span className="fb-corner fb-corner--bl" />
            <span className="fb-corner fb-corner--br" />
            <div className="fullbleed__caption">
              &ldquo;digambar ulang berkali-kali, sampai akhirnya pas.&rdquo;
            </div>
          </section>

          {/* ============================================================
              EVENT — dynamic (Spesifikasi Acara & Pita Ukur Countdown)
              ============================================================ */}
          <section
            className="event"
            id="section-event"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
            data-panel-source="fullbleed-1"
          >
            <div className="section-tag reveal">Waktu &amp; Tempat</div>
            <h2 className="event__title reveal reveal-delay-1">Spesifikasi Acara</h2>

            <div className="event__row reveal">
              <div className="event__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <rect x="3" y="5" width="18" height="16" rx="1" />
                  <path d="M3 9h18M8 3v4M16 3v4" />
                </svg>
              </div>
              <div>
                <div className="event__label">Tanggal</div>
                <div className="event__value">{eventDateFormatted}</div>
              </div>
            </div>

            <div className="event__row reveal reveal-delay-1">
              <div className="event__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
              </div>
              <div>
                <div className="event__label">Lokasi</div>
                <div className="event__value">{fullLocation}</div>
              </div>
            </div>

            <div className="event__schedules reveal reveal-delay-2">
              <div className="event__sched-card">
                <div className="event__label">Akad Nikah</div>
                <b>{akadTime}</b>
              </div>
              <div className="event__sched-card">
                <div className="event__label">Resepsi</div>
                <b>{resepsiTime}</b>
              </div>
            </div>

            <div
              className="countdown reveal reveal-delay-3"
              id="countdown"
              aria-label="Hitung mundur menuju hari bahagia"
            >
              <div className="countdown__row">
                <span className="countdown__label">Hari</span>
                <div className="countdown__ruler">
                  <div className="countdown__fill" style={{ width: fillD }} />
                </div>
                <span className="countdown__num">{cd.days}</span>
              </div>
              <div className="countdown__row">
                <span className="countdown__label">Jam</span>
                <div className="countdown__ruler">
                  <div className="countdown__fill" style={{ width: fillH }} />
                </div>
                <span className="countdown__num">{cd.hours}</span>
              </div>
              <div className="countdown__row">
                <span className="countdown__label">Menit</span>
                <div className="countdown__ruler">
                  <div className="countdown__fill" style={{ width: fillM }} />
                </div>
                <span className="countdown__num">{cd.mins}</span>
              </div>
              <div className="countdown__row">
                <span className="countdown__label">Detik</span>
                <div className="countdown__ruler">
                  <div className="countdown__fill" style={{ width: fillS }} />
                </div>
                <span className="countdown__num">{cd.secs}</span>
              </div>
            </div>

            <button
              className={`gift__copybtn cal-btn reveal ${calSaved ? 'is-copied' : ''}`}
              type="button"
              onClick={handleSaveCalendarIcs}
            >
              {calSaved ? 'Tersimpan ✓' : 'Simpan ke Kalender'}
            </button>
          </section>

          {/* ============================================================
              RANGKAIAN ACARA — dynamic list (Jadwal Pelaksanaan)
              ============================================================ */}
          <section
            className="rundown"
            id="section-rundown"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
            data-panel-source="gate-bp"
          >
            <div className="section-tag reveal">Rangkaian Acara</div>
            <h2 className="rundown__title reveal reveal-delay-1">Jadwal Pelaksanaan</h2>
            <div className="rundown__list">
              {RUNDOWN_ITEMS.map((item, idx) => (
                <div key={idx} className="rundown__item reveal">
                  <div className="rundown__time">{item.time}</div>
                  <div>
                    <div className="rundown__name">{item.title}</div>
                    <div className="rundown__desc">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================================
              LOKASI & DENAH — dynamic
              ============================================================ */}
          <section
            className="venue"
            id="section-venue"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
            data-panel-source="elevation-2"
          >
            <div className="section-tag reveal">Lokasi</div>
            <h2 className="venue__title reveal reveal-delay-1">Denah Lokasi</h2>
            <svg
              className="venue__plan reveal reveal-delay-2"
              viewBox="0 0 300 170"
              role="img"
              aria-label="Denah sederhana lokasi acara"
            >
              <path className="plan-road" d="M0 128H300M54 0V170M246 0V170" />
              <path
                className="plan-road"
                d="M150 100V128"
                style={{ strokeDasharray: 'none' }}
              />
              <rect className="plan-bld" x="96" y="38" width="108" height="62" />
              <circle className="plan-ring" cx="150" cy="69" r="6" />
              <circle className="plan-pin" cx="150" cy="69" r="4" />
              <text className="plan-txt" x="150" y="30" textAnchor="middle">
                Lokasi acara
              </text>
              <text className="plan-txt" x="150" y="146" textAnchor="middle">
                Jalan utama
              </text>
              <path
                className="plan-road"
                d="M18 34l7-14 7 14z"
                style={{ strokeDasharray: 'none' }}
              />
              <text className="plan-txt" x="25" y="46" textAnchor="middle">
                U
              </text>
            </svg>
            <div className="event__value reveal">{fullLocation}</div>
            <a
              className="venue__btn reveal"
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buka di Google Maps
            </a>
            <p className="venue__note reveal">
              Area parkir tersedia di halaman gedung. Mohon datang 15 menit sebelum acara dimulai.
            </p>
          </section>

          {/* ============================================================
              OUR STORY — dynamic list (Linimasa Revisi)
              ============================================================ */}
          <section
            className="story"
            id="section-story"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <div className="section-tag reveal">Kisah Kami</div>
            <h2 className="story__title reveal reveal-delay-1">Linimasa Revisi</h2>

            <div className="story__path">
              <div className="story__item reveal">
                <div className="story__rev">A</div>
                <div className="story__date">Maret 2021</div>
                <div className="story__item-title">Pertama Bertemu</div>
                <div className="story__desc">
                  Bertemu di sebuah proyek kolaborasi kampus, saling mengoreksi sketsa satu sama lain.
                </div>
                <div className="story__photo">
                  <img src={galleryPhotos[0]} alt="Momen pertama bertemu" />
                </div>
              </div>

              <div className="story__item reveal reveal-delay-1">
                <div className="story__rev">B</div>
                <div className="story__date">Juli 2023</div>
                <div className="story__item-title">Lamaran</div>
                <div className="story__desc">
                  Revisi besar: dari dua rencana terpisah menjadi satu cetak biru bersama.
                </div>
                <div className="story__photo">
                  <img src={galleryPhotos[1]} alt="Momen lamaran" />
                </div>
              </div>

              <div className="story__item reveal reveal-delay-2">
                <div className="story__rev">C</div>
                <div className="story__date">November 2026</div>
                <div className="story__item-title">Hari Peresmian</div>
                <div className="story__desc">
                  Dan kini, kami mengundang Anda untuk menyaksikan peresmiannya.
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              FULLBLEED 2 — statis, dua "gambar tampak" (elevation)
              ============================================================ */}
          <section
            className="fullbleed fullbleed--elevation"
            id="section-fullimage-2"
            data-section-type="static"
            data-panel-source="elevation-1"
            data-panel-source-right="elevation-2"
          >
            <div className="elevation">
              <div className="elevation__dim">
                <span>Tampak A</span>
              </div>
              <img src={elevation1Photo} alt="Detail tangan berpegangan" />
            </div>
            <div className="elevation">
              <div className="elevation__dim">
                <span>Tampak B</span>
              </div>
              <img src={elevation2Photo} alt="Detail momen berdua" />
            </div>
          </section>

          {/* ============================================================
              GALERI — dynamic-gallery, masonry + peel + lightbox
              ============================================================ */}
          <section
            className="gallery"
            id="section-gallery"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
            data-panel-source="gallery-1"
          >
            <div className="section-tag reveal">Galeri</div>
            <h2 className="gallery__title reveal reveal-delay-1">Lembar Dokumentasi</h2>
            <p className="gallery__hint reveal reveal-delay-2">
              Ketuk sebuah lembar untuk melihat lebih dekat
            </p>

            <div className="gallery__grid" id="galleryGrid">
              {galleryPhotos.map((src, idx) => (
                <div
                  key={idx}
                  className="print-thumb reveal"
                  style={{ transitionDelay: `${(idx % 2) * 0.12}s` }}
                  onClick={() => setLightboxIdx(idx)}
                >
                  <img src={src} alt={`Galeri foto ${idx + 1}`} />
                  <span className="print-thumb__peel" />
                  <span className="print-thumb__tag">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================================
              DRESS CODE — dynamic (Palet Material)
              ============================================================ */}
          <section
            className="dress"
            id="section-dresscode"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
            data-panel-source="gallery-1"
          >
            <div className="section-tag reveal">Busana</div>
            <h2 className="dress__title reveal reveal-delay-1">Palet Material</h2>
            <p className="dress__note reveal reveal-delay-2">
              Kami mengundang Anda berbusana dalam palet berikut agar selaras dengan suasana hari itu.
            </p>
            <div className="dress__swatches">
              {DRESSCODE_SWATCHES.map((sw, idx) => (
                <div
                  key={sw.hex}
                  className={`dress__sw reveal ${
                    idx > 0 ? `reveal-delay-${idx}` : ''
                  }`}
                >
                  <div className="dress__chip" style={{ background: sw.hex }} />
                  <div className="dress__name">{sw.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================================
              GIFT / AMPLOP — dynamic
              ============================================================ */}
          <section
            className="gift"
            id="section-gift"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <div className="section-tag reveal">Tanda Kasih</div>
            <h2 className="gift__title reveal reveal-delay-1">Amplop Digital</h2>
            <p className="gift__desc reveal reveal-delay-2">
              Doa restu Anda adalah material terbaik. Jika berkenan memberi tanda kasih, kami sediakan opsi berikut.
            </p>

            <div className="gift__card reveal reveal-delay-3">
              <span className="gift__reqno">REQ &mdash; 01</span>
              <div className="gift__bank">Transfer Bank &mdash; {bankName}</div>
              <div className="gift__number">{accountNumber}</div>
              <div className="gift__owner">a.n. {accountHolder}</div>
              <button
                className={`gift__copybtn ${isCopied('bank-1') ? 'is-copied' : ''}`}
                type="button"
                onClick={() => copyText(accountNumber.replace(/\s+/g, ''), 'bank-1')}
              >
                {isCopied('bank-1') ? 'Tersalin ✓' : 'Salin Nomor Rekening'}
              </button>
            </div>

            {customData?.secondaryBankName && customData?.secondaryAccountNumber && (
              <div className="gift__card reveal">
                <span className="gift__reqno">REQ &mdash; 02</span>
                <div className="gift__bank">
                  Transfer Bank &mdash; {customData.secondaryBankName}
                </div>
                <div className="gift__number">{customData.secondaryAccountNumber}</div>
                <div className="gift__owner">
                  a.n. {customData.secondaryAccountHolder || groomFullName}
                </div>
                <button
                  className={`gift__copybtn ${isCopied('bank-2') ? 'is-copied' : ''}`}
                  type="button"
                  onClick={() =>
                    copyText(
                      (customData.secondaryAccountNumber || '').replace(/\s+/g, ''),
                      'bank-2'
                    )
                  }
                >
                  {isCopied('bank-2') ? 'Tersalin ✓' : 'Salin Nomor Rekening'}
                </button>
              </div>
            )}

            <p className="gift__note reveal">
              Kado fisik dapat dikirim ke lokasi kediaman keluarga mempelai ({city}), u.p. Keluarga {brideName}.
            </p>
          </section>

          {/* ============================================================
              GUESTBOOK & RSVP — dynamic list (Catatan Revisi Tamu)
              ============================================================ */}
          <section
            className="guestbook"
            id="section-guestbook"
            data-section-type="dynamic"
            data-invitation-type="pernikahan"
          >
            <div className="section-tag reveal">Ucapan &amp; RSVP</div>
            <h2 className="guestbook__title reveal reveal-delay-1">Catatan Revisi Tamu</h2>
            <p className="guestbook__sub reveal reveal-delay-2">
              Tinggalkan konfirmasi kehadiran dan doa terbaik Anda untuk kami
            </p>

            <form className="guestbook__form reveal" onSubmit={handleGuestbookFormSubmit}>
              <div className="guestbook__field">
                <label htmlFor="cbGuestName">Nama</label>
                <input
                  id="cbGuestName"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nama Anda"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="guestbook__field mb-0">
                  <label htmlFor="cbAttendance">Konfirmasi Kehadiran</label>
                  <select
                    id="cbAttendance"
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
                </div>

                <div className="guestbook__field mb-0">
                  <label htmlFor="cbCount">Jumlah Tamu</label>
                  <select
                    id="cbCount"
                    value={guestCountInput}
                    onChange={(e) => setGuestCountInput(Number(e.target.value))}
                  >
                    <option value={1}>1 Orang</option>
                    <option value={2}>2 Orang</option>
                    <option value={3}>3 Orang</option>
                    <option value={4}>4 Orang</option>
                  </select>
                </div>
              </div>

              <div className="guestbook__field">
                <label htmlFor="cbGuestMsg">Ucapan &amp; Doa</label>
                <textarea
                  id="cbGuestMsg"
                  rows={3}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Tuliskan doa dan ucapan Anda..."
                  required
                />
              </div>
              <button className="guestbook__submit" type="submit">
                Kirim Ucapan &amp; RSVP
              </button>
            </form>

            <div className="guestbook__list" id="guestbookList">
              {wishes.map((w, idx) => (
                <div key={idx} className="guestbook__item">
                  <div className="guestbook__item-name">{w.name}</div>
                  <div className="guestbook__item-msg">{w.message}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================================
              CLOSING — statis
              ============================================================ */}
          <section
            className="closing"
            id="section-closing"
            data-section-type="static"
            data-panel-source="closing-bp"
          >
            <div
              className="closing__bg"
              style={{ backgroundImage: `url('${closingBgPhoto}')` }}
            />
            <div className="closing__grid" />
            <div className="closing__content">
              <p className="closing__quote reveal">
                &ldquo;Terima kasih telah ikut menandatangani lembar pengesahan hari bahagia kami.&rdquo;
              </p>
              <div className="closing__titleblock titleblock reveal reveal-delay-1">
                <div className="titleblock__row">
                  <div className="titleblock__cell">
                    <span className="titleblock__label">Lembar</span>
                    <span className="titleblock__val">Terakhir</span>
                  </div>
                  <div className="titleblock__cell">
                    <span className="titleblock__label">Status</span>
                    <span className="titleblock__val">Disahkan</span>
                  </div>
                </div>
              </div>
              <div className="closing__credit reveal reveal-delay-2">
                Cetak Biru &middot; {groomName} &amp; {brideName} &middot; Sekarsiti
              </div>
            </div>
          </section>
        </main>

        {/* PANEL KANAN — dinamis, lebih sempit, desktop only */}
        <div className="panel-image panel-image--right" aria-hidden="true">
          <div
            className={`panel-image__layer ${activeRightIdx === 0 ? 'is-active' : ''}`}
            style={{ backgroundImage: `url('${rightLayers[0]}')` }}
          />
          <div
            className={`panel-image__layer ${activeRightIdx === 1 ? 'is-active' : ''}`}
            style={{ backgroundImage: `url('${rightLayers[1]}')` }}
          />
          <div className="panel-image__grid" />
          <div className="panel-image__veil" />
          <span className="panel-image__corner panel-image__corner--tl" />
          <span className="panel-image__corner panel-image__corner--br" />
          <div className="panel-image__label">
            <small>Lembar &mdash; B</small>
            {shortDateTwoDigit}
          </div>
        </div>
      </div>

      {/* Lightbox Global untuk Galeri & Potret Mempelai */}
      <div
        className={`lightbox ${lightboxIdx !== null || customLightbox !== null ? 'is-open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setLightboxIdx(null);
            setCustomLightbox(null);
          }
        }}
      >
        <div
          className="lightbox__stage"
          onPointerDown={(e) => {
            touchStartXRef.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (customLightbox) return;
            const dx = e.clientX - touchStartXRef.current;
            if (Math.abs(dx) > 40) {
              stepLightbox(dx < 0 ? 1 : -1);
            }
          }}
        >
          {customLightbox ? (
            <img
              src={customLightbox.src}
              alt={customLightbox.alt}
              referrerPolicy="no-referrer"
            />
          ) : (
            lightboxIdx !== null && (
              <img
                src={galleryPhotos[lightboxIdx]}
                alt={`Foto galeri ${lightboxIdx + 1} diperbesar`}
                referrerPolicy="no-referrer"
              />
            )
          )}
          <span className="fb-corner fb-corner--tl" />
          <span className="fb-corner fb-corner--tr" />
          <span className="fb-corner fb-corner--bl" />
          <span className="fb-corner fb-corner--br" />
        </div>
        <button
          className="lightbox__close"
          type="button"
          aria-label="Tutup"
          onClick={() => {
            setLightboxIdx(null);
            setCustomLightbox(null);
          }}
        >
          &times;
        </button>
        {!customLightbox && (
          <>
            <button
              className="lightbox__prev"
              type="button"
              aria-label="Sebelumnya"
              onClick={() => stepLightbox(-1)}
            >
              &larr;
            </button>
            <button
              className="lightbox__next"
              type="button"
              aria-label="Berikutnya"
              onClick={() => stepLightbox(1)}
            >
              &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
};
