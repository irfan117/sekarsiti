import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowUp,
  Copy, 
  Check, 
  MapPin, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Disc3,
  Disc,
  Calendar,
  X,
  Edit2,
  Sparkles,
  QrCode,
  Clock,
  Compass,
  ZoomIn,
  Heart
} from 'lucide-react';
import { 
  MotionStyles, 
  Reveal, 
  TickDigit, 
  GoldDust, 
  ScrollProgressBar 
} from './malamZamrudMotion';
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

interface MalamZamrudTemplateProps {
  onBackToLanding: () => void;
  onOrderViaWhatsApp: () => void;
  customData?: ClientInvitationData;
}

// Section definitions for live sync & navigation
const SECTIONS = [
  { id: 'hero-video', label: 'Pembuka', number: '01' },
  { id: 'couple', label: 'Mempelai & Keluarga', number: '02' },
  { id: 'salam', label: 'Salam Pembuka', number: '03' },
  { id: 'datetime', label: 'Waktu & Jadwal', number: '04' },
  { id: 'lokasi', label: 'Lokasi Acara', number: '05' },
  { id: 'spotlight-1', label: 'Momen Senja', number: '06' },
  { id: 'turut', label: 'Turut Mengundang', number: '07' },
  { id: 'our-story', label: 'Kisah Kami', number: '08' },
  { id: 'dresscode', label: 'Ketentuan Busana', number: '09' },
  { id: 'spotlight-2', label: 'Janji Suci', number: '10' },
  { id: 'gallery', label: 'Galeri Momen', number: '11' },
  { id: 'gift', label: 'Tanda Kasih', number: '12' },
  { id: 'guestbook', label: 'Ucapan & Doa', number: '13' },
  { id: 'rsvp', label: 'RSVP', number: '14' },
  { id: 'closing', label: 'Penutup', number: '15' }
];

// ============================================================
// AUTHENTIC ART DECO ARCHITECTURAL ORNAMENTS (1920s GATSBY)
// Presisi geometris, konsentris, sunburst bertingkat & sudut ziggurat
// ============================================================
const ArtDecoSunburst: React.FC<{ className?: string; inverted?: boolean }> = ({ 
  className = "w-20 h-10 text-[#C6A356]", 
  inverted = false 
}) => (
  <svg 
    className={`${className} ${inverted ? 'rotate-180' : ''}`} 
    viewBox="0 0 120 60" 
    fill="none" 
    stroke="currentColor"
    aria-hidden="true"
  >
    {/* Concentric baseline arcs */}
    <path d="M 12 60 A 48 48 0 0 1 108 60" strokeWidth="0.8" opacity="0.35" />
    <path d="M 24 60 A 36 36 0 0 1 96 60" strokeWidth="1" opacity="0.6" />
    <path d="M 38 60 A 22 22 0 0 1 82 60" strokeWidth="1.2" opacity="0.85" />
    <path d="M 50 60 A 10 10 0 0 1 70 60" strokeWidth="1.4" />
    {/* Center origin diamond */}
    <polygon points="60,53 63,57 60,60 57,57" fill="currentColor" stroke="none" />
    {/* Primary radiating rays */}
    <line x1="60" y1="50" x2="60" y2="2" strokeWidth="1.6" />
    <line x1="53" y1="51" x2="38" y2="6" strokeWidth="1.3" />
    <line x1="67" y1="51" x2="82" y2="6" strokeWidth="1.3" />
    <line x1="47" y1="54" x2="20" y2="15" strokeWidth="1.2" />
    <line x1="73" y1="54" x2="100" y2="15" strokeWidth="1.2" />
    <line x1="42" y1="57" x2="6" y2="30" strokeWidth="1.1" />
    <line x1="78" y1="57" x2="114" y2="30" strokeWidth="1.1" />
    {/* Secondary interstitial rays */}
    <line x1="56" y1="51" x2="49" y2="18" strokeWidth="0.8" opacity="0.65" />
    <line x1="64" y1="51" x2="71" y2="18" strokeWidth="0.8" opacity="0.65" />
    <line x1="50" y1="53" x2="30" y2="24" strokeWidth="0.8" opacity="0.65" />
    <line x1="70" y1="53" x2="90" y2="24" strokeWidth="0.8" opacity="0.65" />
    <line x1="44" y1="56" x2="14" y2="39" strokeWidth="0.8" opacity="0.5" />
    <line x1="76" y1="56" x2="106" y2="39" strokeWidth="0.8" opacity="0.5" />
    {/* Stepped chevron crest at apex */}
    <path d="M 60 2 L 64 7 L 60 11 L 56 7 Z" fill="currentColor" stroke="none" />
    <path d="M 38 6 L 41 10 L 38 13 L 35 10 Z" fill="currentColor" stroke="none" opacity="0.8" />
    <path d="M 82 6 L 85 10 L 82 13 L 79 10 Z" fill="currentColor" stroke="none" opacity="0.8" />
  </svg>
);

const ArtDecoCorner: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; className?: string }> = ({ 
  position, 
  className = "text-[#C6A356]" 
}) => {
  const rotationClass = {
    tl: '',
    tr: 'rotate-90',
    bl: '-rotate-90',
    br: 'rotate-180'
  }[position];

  return (
    <svg 
      className={`w-5 h-5 ${rotationClass} ${className}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M 2 18 L 2 2 L 18 2" strokeWidth="1.6" />
      <path d="M 6 14 L 6 6 L 14 6" strokeWidth="1" opacity="0.75" />
      <path d="M 9 9 L 9 9" strokeWidth="2.2" strokeLinecap="square" />
      <polygon points="3,3 5,1 3,-1 1,1" fill="currentColor" stroke="none" transform="translate(1, 1)" />
    </svg>
  );
};

const ArtDecoDivider: React.FC<{ className?: string }> = ({ 
  className = "my-5 text-[#C6A356]" 
}) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#C6A356]/60 to-[#C6A356]" />
    <svg className="w-4 h-4 text-current flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <polygon points="10,2 18,10 10,18 2,10" strokeWidth="1.2" />
      <polygon points="10,6 14,10 10,14 6,10" strokeWidth="0.9" opacity="0.7" />
      <circle cx="10" cy="10" r="1.3" fill="currentColor" stroke="none" />
    </svg>
    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-[#C6A356]/60 to-[#C6A356]" />
  </div>
);

export const MalamZamrudTemplate: React.FC<MalamZamrudTemplateProps> = ({
  onBackToLanding,
  onOrderViaWhatsApp,
  customData,
}) => {
  // Extract custom client data or elegant fallbacks
  const brideName = customData?.brideName || 'Kirana';
  const brideFullName = customData?.brideFullName || 'Kirana Ayu Lestari, S.Ds.';
  const brideParents = customData?.brideParents || 'Putri pertama dari Bapak Hendra Wijaya & Ibu Sinta Maharani';
  const brideInstagram = customData?.brideInstagram || '@kiranaayuu';

  const groomName = customData?.groomName || 'Adhitya';
  const groomFullName = customData?.groomFullName || 'Adhitya Nugraha, B.Eng.';
  const groomParents = customData?.groomParents || 'Putra kedua dari Bapak Suryanto Nugraha & Ibu Ratna Dewi';
  const groomInstagram = customData?.groomInstagram || '@adhityanugraha';

  const eventDateFormatted = customData?.eventDateFormatted || 'Minggu, 14 Februari 2027';
  const countdownIsoDate = customData?.countdownIsoDate || '2027-02-14T08:00:00+07:00';
  const akadTime = customData?.akadTime || '08.00 – 09.30 WIB';
  const akadVenue = customData?.akadVenue || 'Ruang Bimasena, Aryaduta Hotel';
  const resepsiTime = customData?.resepsiTime || '11.00 – 14.00 WIB';
  const resepsiVenue = customData?.resepsiVenue || 'Grand Ballroom, Aryaduta Hotel';
  const city = customData?.city || 'Jakarta Selatan';
  const mapsUrl = customData?.mapsUrl || 'https://maps.google.com';

  const bankName = customData?.bankName || 'BCA';
  const accountNumber = customData?.accountNumber || '1234567890';
  const accountHolder = customData?.accountHolder || 'Kirana Ayu Lestari';
  const songTitle = customData?.songTitle || 'Until I Found You - Stephen Sanchez';
  const audioUrl = customData?.audioUrl || '';

  // Opening state: isOpeningFlap controls 3D flap fold, isOpened lifts envelope, isCoverDismissed removes gate
  const [isOpeningFlap, setIsOpeningFlap] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isCoverDismissed, setIsCoverDismissed] = useState(false);

  // Bank copy toast & QRIS modal
  const [showQrisModal, setShowQrisModal] = useState(false);

  // Modular Hooks: Guest personalization, Audio, Clipboard, Countdown, Guestbook, RSVP
  const { guestName, hideGuestName } = useGuestRecipient('Bpk. Hendra Wijaya & Keluarga');
  const { isPlayingAudio, showAudioToast, toggleAudio, startAudio } = useAudioController(songTitle, audioUrl);
  const { copyText, isCopied } = useClipboardCopy(2500);
  const timeLeft = useCountdown(countdownIsoDate);

  const initialWishes = customData?.guestbookEntries && customData.guestbookEntries.length > 0
    ? customData.guestbookEntries
    : [
        {
          name: 'Salsabila Putri',
          message: 'Selamat menempuh hidup baru Kirana & Adhitya. Semoga senantiasa diberkahi kebahagiaan, ketenteraman, dan cinta yang abadi dalam bahtera rumah tangga.',
          time: '1 jam yang lalu'
        },
        {
          name: 'Dimas & Nadia',
          message: 'Selamat berbahagia sahabatku! Doa terbaik senantiasa menyertai babak baru kehidupan kalian.',
          time: '4 jam yang lalu'
        }
      ];

  const {
    wishes,
    nameInput: guestNameInput,
    setNameInput: setGuestNameInput,
    messageInput: guestMsgInput,
    setMessageInput: setGuestMsgInput,
    submitWish: handleGuestbookSubmit
  } = useGuestbook(initialWishes, customData?.id);

  const {
    rsvpName,
    setRsvpName,
    attendance: rsvpAttendance,
    setAttendance: setRsvpAttendance,
    guestCount: rsvpCount,
    setGuestCount: setRsvpCount,
    isSuccess: rsvpSuccess,
    submitRsvp: handleRsvpSubmit
  } = useRsvpForm(undefined, customData?.id);

  // Lightbox Photo Modal state
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Interactive Dresscode Swatch state
  const [activeSwatch, setActiveSwatch] = useState<'zamrud' | 'kuningan' | 'batatua' | 'gading'>('zamrud');

  const SWATCH_DETAILS = {
    zamrud: {
      name: 'Hijau Zamrud',
      subtitle: 'Emerald Green',
      color: '#1E4438',
      textColor: '#FBF3E4',
      badge: 'Palet Utama',
      forLadies: 'Gaun malam velvet/sutra, kebaya modern berona zamrud, atau dress bordir hijau botol.',
      forGentlemen: 'Batik sutra berona gelap, jas malam klasik, atau dasi satin hijau zamrud.'
    },
    kuningan: {
      name: 'Kuningan Antik',
      subtitle: 'Vintage Brass Gold',
      color: '#C6A356',
      textColor: '#0B0D10',
      badge: 'Aksen Kilau',
      forLadies: 'Gaun satin champagne, perhiasan emas antik, atau aksen payet mewah.',
      forGentlemen: 'Kemeja bernuansa warm gold, cufflink kuningan, atau dasi champagne.'
    },
    batatua: {
      name: 'Bata Tua',
      subtitle: 'Terracotta Rust',
      color: '#8C4A36',
      textColor: '#FBF3E4',
      badge: 'Sentuhan Hangat',
      forLadies: 'Kebaya brokat terakota hangat, gaun pleated marun muda, atau selendang tenun.',
      forGentlemen: 'Kemeja batik bernuansa sogan/terakota, atau jas santai warna tanah.'
    },
    gading: {
      name: 'Gading Lembut',
      subtitle: 'Warm Ivory',
      color: '#EDE3C8',
      textColor: '#181512',
      badge: 'Harmoni Netral',
      forLadies: 'Gaun sutra krem gading, dress renda vintage, atau kerudung berona soft ivory.',
      forGentlemen: 'Kemeja broken white premium atau beskap klasik berona gading.'
    }
  };

  const allAdminUploadedImages = React.useMemo(
    () => collectAdminUploadedPhotos(customData),
    [customData]
  );

  // Gallery image assets: 100% dari upload admin saat customData aktif (bebas jumlah, tanpa minimal/maksimal)
  const galleryImages = customData
    ? customData.mediaSlots?.galleryImages && customData.mediaSlots.galleryImages.length > 0
      ? customData.mediaSlots.galleryImages.filter((u) => Boolean(u && !isVideoUrl(u)))
      : allAdminUploadedImages
    : [
        '/images/editorial_couple_portrait_1790838636662.jpg',
        '/images/wedding_vows_bouquet_1790901516667.jpg',
        '/images/wedding_dance_lights_1790901533590.jpg',
        '/images/art_deco_venue_details_1790840351864.jpg',
        '/images/editorial_venue_rings_1790838653826.jpg',
        '/images/wedding_table_botanical_1790833955186.jpg',
        '/images/wedding_shoes_jewelry_1790901548736.jpg',
        '/images/sage_outdoor_couple_portrait_1790919006777.jpg'
      ];

  const panelSourcePhotos = React.useMemo(() => {
    if (!customData) return [];
    const customPanel = (customData.mediaSlots?.leftPanelImages || []).filter(
      (u) => Boolean(u && !isVideoUrl(u))
    );
    return customPanel.length > 0 ? customPanel : allAdminUploadedImages;
  }, [customData, allAdminUploadedImages]);

  const rawHeroMedia = customData?.mediaSlots?.heroImage || '';
  const heroVideoUrl = customData
    ? customData.mediaSlots?.heroVideo || (isVideoUrl(rawHeroMedia) ? rawHeroMedia : '')
    : '/videos/wedding-evening.mp4';
  const heroImage =
    !isVideoUrl(rawHeroMedia) && rawHeroMedia
      ? rawHeroMedia
      : galleryImages[0] || allAdminUploadedImages[0] || (!customData ? '/images/art_deco_emerald_couple_1790840336340.jpg' : '');
  const isCoverVideo =
    isVideoUrl(rawHeroMedia) || Boolean(customData?.mediaSlots?.heroVideo && !rawHeroMedia);
  const bridePortrait = customData
    ? customData.mediaSlots?.bridePortrait || (allAdminUploadedImages.length > 1 ? allAdminUploadedImages[1] : allAdminUploadedImages[0]) || ''
    : '/images/wedding_bride_veil_1790901501919.jpg';
  const groomPortrait = customData
    ? customData.mediaSlots?.groomPortrait || (allAdminUploadedImages.length > 2 ? allAdminUploadedImages[2] : allAdminUploadedImages[0]) || ''
    : '/images/editorial_groom_portrait_1790915490996.jpg';
  const spotlightImage = customData
    ? customData.mediaSlots?.spotlightImage || (panelSourcePhotos.length > 3 ? panelSourcePhotos[3] : '') || galleryImages[1] || galleryImages[0] || heroImage || ''
    : '/images/art_deco_venue_details_1790840351864.jpg';
  const closingImage = customData
    ? customData.mediaSlots?.closingImage || (panelSourcePhotos.length > 4 ? panelSourcePhotos[panelSourcePhotos.length - 1] : '') || galleryImages[galleryImages.length - 1] || galleryImages[0] || heroImage || ''
    : '/images/wedding_dance_lights_1790901533590.jpg';
  const quoteText = customData?.quoteText || 'Bunga melati tumbuh berseri, mekar indah di taman hati. Dua insan berjanji sehidup semati, menyatu dalam ikatan suci.';
  const quoteSource = customData?.quoteSource || 'Syair Kasih Klasik';
  const secondaryBankName = customData?.secondaryBankName;
  const secondaryAccountNumber = customData?.secondaryAccountNumber;
  const secondaryAccountHolder = customData?.secondaryAccountHolder;
  const qrisImageUrl = customData?.qrisImageUrl || customData?.mediaSlots?.qrisImageUrl;

  // Continuous Filmstrip Photos for Left (Portraits & Moments) and Right (Details & Atmosphere)
  const leftFilmstripPhotos = customData
    ? panelSourcePhotos.map((src, idx) => ({
        src,
        tag: `${brideName.toUpperCase()} & ${groomName.toUpperCase()} · ${String(idx + 1).padStart(2, '0')}`,
        caption: idx === 0 ? 'Mempelai Berbahagia' : `Momen Dokumentasi #${String(idx + 1).padStart(2, '0')}`
      }))
    : [
        { src: heroImage, tag: `${brideName.toUpperCase()} & ${groomName.toUpperCase()} · 01`, caption: 'Mempelai Berbahagia' },
        { src: bridePortrait, tag: 'THE BRIDE · 02', caption: 'Anggun Dalam Balutan Gaun' },
        { src: groomPortrait, tag: 'THE GROOM · 03', caption: 'Keteguhan Janji Suci' },
        { src: '/images/wedding_dance_lights_1790901533590.jpg', tag: 'FIRST DANCE · 04', caption: 'Tarian Pertama di Bawah Cahaya' },
        { src: '/images/sage_outdoor_couple_portrait_1790919006777.jpg', tag: 'ROMANTIC MOMENT · 05', caption: 'Langkah Awal Bersama' },
        { src: '/images/wedding_couple_portrait_1790833906470.jpg', tag: 'FOREVER AFTER · 06', caption: 'Cinta Seumur Hidup' },
      ];

  const rightFilmstripPhotos = customData
    ? [...panelSourcePhotos].reverse().map((src, idx) => ({
        src,
        tag: `GALERI MALAM · ${String(idx + 1).padStart(2, '0')}`,
        caption: `${resepsiVenue} · Frame ${String(idx + 1).padStart(2, '0')}`
      }))
    : [
        { src: '/images/art_deco_venue_details_1790840351864.jpg', tag: 'BALLROOM · 01', caption: 'Kemilau Lilin & Meja Jamuan' },
        { src: '/images/wedding_shoes_jewelry_1790901548736.jpg', tag: 'DETAILS · 02', caption: 'Sepatu Sutra & Perhiasan Emas' },
        { src: '/images/editorial_venue_rings_1790838653826.jpg', tag: 'RINGS · 03', caption: 'Cincin Emas di Atas Travertine' },
        { src: '/images/wedding_table_botanical_1790833955186.jpg', tag: 'BLOOMS · 04', caption: 'Rangkaian Mawar & Daun Eukaliptus' },
        { src: '/images/botanical_estate_venue_1790919022237.jpg', tag: 'EVENING GLOW · 05', caption: 'Suasana Temaram Resepsi' },
        { src: '/images/brand_story_botanical_1790831303860.jpg', tag: 'PROMISE · 06', caption: 'Buku Janji & Momen Khidmat' },
        { src: '/images/wedding_dance_lights_1790901533590.jpg', tag: 'SOIREE · 07', caption: 'Pesta Dansa di Bawah Lentera Emas' },
      ];

  const storyMilestones = React.useMemo(() => {
    const rawChapters = customData?.mediaSlots?.storyChapters;
    if (Array.isArray(rawChapters)) {
      if (rawChapters.length === 0) return [];
      return rawChapters.map((ch, idx) => ({
        chapter: ch.chapter || `BABAK ${String(idx + 1).padStart(2, '0')}`,
        date: ch.date || '',
        location: ch.location || '',
        title: ch.title || `Babak ${idx + 1}`,
        quote: ch.quote || '',
        story: ch.story || '',
        image:
          ch.image && !isVideoUrl(ch.image)
            ? ch.image
            : (allAdminUploadedImages.length > idx ? allAdminUploadedImages[idx] : '')
      }));
    }
    return [
      {
        chapter: 'BABAK 01',
        date: 'Agustus 2019',
        location: '',
        title: 'Pertemuan Pertama',
        quote: '',
        story: 'Bertemu tanpa sengaja di sebuah acara kampus, dan sejak itu percakapan tak pernah berhenti.',
        image: customData
          ? (allAdminUploadedImages.length > 0 ? allAdminUploadedImages[0] : '')
          : '/images/film_vintage_couple_1791034007642.jpg'
      },
      {
        chapter: 'BABAK 02',
        date: 'Desember 2022',
        location: '',
        title: 'Lamaran',
        quote: '',
        story: 'Di depan keluarga besar, sebuah janji sederhana disampaikan dan diterima dengan haru.',
        image: customData
          ? (allAdminUploadedImages.length > 1 ? allAdminUploadedImages[1] : allAdminUploadedImages[0] || '')
          : '/images/wedding_ring_exchange_1790833922500.jpg'
      },
      {
        chapter: 'BABAK 03',
        date: 'Februari 2027',
        location: '',
        title: 'Hari Bahagia',
        quote: '',
        story: 'Babak baru dimulai — dua keluarga menjadi satu, disaksikan orang-orang tercinta.',
        image: customData
          ? (allAdminUploadedImages.length > 2 ? allAdminUploadedImages[2] : allAdminUploadedImages[0] || '')
          : '/images/wedding_couple_portrait_1790833906470.jpg'
      }
    ];
  }, [customData, allAdminUploadedImages]);

  // Active section tracking & Smooth Continuous Scroll Progress
  const [activeSectionId, setActiveSectionId] = useState('hero-video');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const leftStripRef = useRef<HTMLDivElement>(null);
  const rightStripRef = useRef<HTMLDivElement>(null);
  const [stripTravel, setStripTravel] = useState({ left: 1400, right: 1400 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / scrollable)));
      }
    };

    const updateMeasurements = () => {
      const vh = window.innerHeight;
      if (leftStripRef.current) {
        const h = leftStripRef.current.scrollHeight;
        setStripTravel(prev => ({ ...prev, left: Math.max(0, h - vh + 120) }));
      }
      if (rightStripRef.current) {
        const h = rightStripRef.current.scrollHeight;
        setStripTravel(prev => ({ ...prev, right: Math.max(0, h - vh + 120) }));
      }
      handleScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateMeasurements);
    setTimeout(updateMeasurements, 200);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [isOpened]);

  // Section Observer for active indicator
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        });
        if (bestEntry) {
          const entryTarget = bestEntry as IntersectionObserverEntry;
          setActiveSectionId(entryTarget.target.id);
        }
      },
      { threshold: [0.2, 0.5, 0.8], rootMargin: '-10% 0px -15% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isOpened]);

  const leftTranslateY = -(scrollProgress * stripTravel.left);
  const rightTranslateY = -(scrollProgress * stripTravel.right);

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);

  const prevSlide = () => {
    setCarouselIndex(prev => Math.max(0, prev - 1));
  };

  const nextSlide = () => {
    setCarouselIndex(prev => Math.min(galleryImages.length - 1, prev + 1));
  };

  // Open invitation handler (Envelope flap folds open, revealing inner Section 1 letter)
  const handleOpenInvitation = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsOpeningFlap(true);
    startAudio();

    // Lift envelope after 3D flap unfolds
    setTimeout(() => {
      setIsOpened(true);
    }, 450);

    // Dismiss envelope gate after smooth sequence
    setTimeout(() => {
      setIsCoverDismissed(true);
    }, 1250);
  };

  const handleCopyAccount = () => {
    copyText(accountNumber, 'bank');
  };

  const handleCopySecondaryAccount = () => {
    if (secondaryAccountNumber) {
      copyText(secondaryAccountNumber, 'bank-secondary');
    }
  };

  const handleCopyAddress = () => {
    const fullAddress = `${resepsiVenue}, ${city}`;
    copyText(fullAddress, 'venue-address');
  };

  const handleCopySchedule = () => {
    const scheduleSummary = `Undangan Pernikahan ${brideName} & ${groomName}\nTanggal: ${eventDateFormatted}\nAkad Nikah: ${akadTime} (${akadVenue})\nResepsi: ${resepsiTime} (${resepsiVenue}, ${city})`;
    copyText(scheduleSummary, 'event-schedule');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}+(Malam+Zamrud)&dates=20270214T010000Z/20270214T070000Z&details=Undangan+Pernikahan+${encodeURIComponent(brideFullName)}+%26+${encodeURIComponent(groomFullName)}.+Akad+${encodeURIComponent(akadTime)},+Resepsi+${encodeURIComponent(resepsiTime)}.&location=${encodeURIComponent(resepsiVenue)}`;

  return (
    <div className="relative min-h-screen bg-[#0B0D10] text-[#181512] font-['Manrope',sans-serif] selection:bg-[#C6A356]/30 selection:text-[#0B0D10]">
      {/* Motion Styles Layer & Top Golden Scroll Progress */}
      <MotionStyles />
      {isOpened && <ScrollProgressBar progress={scrollProgress} />}

      {/* Floating Audio Disk Player (Only visible after opening) */}
      {isOpened && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 pointer-events-auto">
          {showAudioToast && (
            <div className="hidden sm:flex items-center gap-2 py-1.5 px-3.5 bg-[#12151A]/90 backdrop-blur-md border border-[#C6A356]/40 text-[#FBF3E4] rounded-full text-xs shadow-xl animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A356] animate-pulse" />
              <span>{isPlayingAudio ? `Musik: ${songTitle}` : 'Musik dijeda'}</span>
            </div>
          )}

          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full border border-[#C6A356]/70 flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
              isPlayingAudio 
                ? 'bg-[#12151A] text-[#C6A356] ring-4 ring-[#C6A356]/20' 
                : 'bg-[#12151A]/80 text-[#FBF3E4]/50 hover:text-[#FBF3E4]'
            }`}
            title={isPlayingAudio ? 'Jeda Musik' : 'Putar Musik'}
            aria-label="Kontrol musik latar"
          >
            {isPlayingAudio ? (
              <Disc3 className="w-5 h-5 text-[#C6A356] anim-spin-vinyl" />
            ) : (
              <Disc className="w-5 h-5 opacity-60" />
            )}
          </button>
        </div>
      )}

      {/* ============================================================
          DESKTOP DUAL SIDE PANELS (Art Deco Editorial Layout: Balanced Columns)
          Kiri: Momen & Mempelai | Tengah: Undangan 480px | Kanan: Atmosfer Ballroom & Detail
          Presisi pixel sempurna tanpa gap dan tanpa gambar terpotong
          ============================================================ */}
      
      {/* 1. LEFT PANEL (Foto Mempelai & Momen Intim) */}
      <aside 
        className="hidden lg:block fixed top-0 bottom-0 left-0 w-[calc((100vw-480px)/2)] overflow-hidden bg-[#0B0D10] border-r border-[#C6A356]/30 z-10"
      >
        <div 
          ref={leftStripRef}
          className="p-6 space-y-7 will-change-transform transition-transform duration-100 ease-out"
          style={{ transform: `translate3d(0, ${leftTranslateY}px, 0)` }}
        >
          {leftFilmstripPhotos.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedPhoto(item.src)}
              className="group relative rounded-2xl overflow-hidden border border-[#C6A356]/30 bg-[#12151A] cursor-pointer shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
            >
              <img 
                src={item.src} 
                alt={item.caption} 
                className="w-full aspect-[3/4] object-cover filter brightness-[0.80] contrast-[1.08] group-hover:brightness-100 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10]/95 via-[#0B0D10]/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="text-[9px] tracking-[0.28em] uppercase text-[#C6A356] font-semibold block">
                  {item.tag}
                </span>
                <p className="font-['Marcellus',serif] text-sm text-[#FBF3E4] font-normal mt-0.5 truncate">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Top & Bottom Vignettes */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#0B0D10] via-[#0B0D10]/80 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/90 to-transparent pointer-events-none z-10" />

        {/* Left Art Deco Top Header Badge */}
        <div className="absolute top-6 left-6 z-20 pointer-events-none p-3 rounded-xl bg-[#12151A]/90 backdrop-blur-md border border-[#C6A356]/35 shadow-xl">
          <p className="text-[8px] tracking-[0.35em] uppercase text-[#C6A356] font-semibold">
            {brideName.toUpperCase()} &amp; {groomName.toUpperCase()}
          </p>
          <p className="font-['Marcellus',serif] text-xs text-[#FBF3E4]">
            Momen &amp; Mempelai
          </p>
        </div>

        {/* Left Art Deco Bottom Badge */}
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none p-3.5 rounded-xl bg-[#12151A]/90 backdrop-blur-md border border-[#C6A356]/35 shadow-xl">
          <p className="text-[8px] tracking-[0.35em] uppercase text-[#C6A356] font-semibold">
            MALAM ZAMRUD · ART DECO
          </p>
          <p className="font-['Marcellus',serif] text-xs text-[#FBF3E4]">
            {brideName} &amp; {groomName}
          </p>
        </div>
      </aside>

      {/* 2. RIGHT PANEL (Detail Kemewahan Ballroom & Navigasi Gatsby) */}
      <aside 
        className="hidden lg:block fixed top-0 bottom-0 right-0 w-[calc((100vw-480px)/2)] overflow-hidden bg-[#0B0D10] border-l border-[#C6A356]/30 z-10"
      >
        <div 
          ref={rightStripRef}
          className="p-6 space-y-7 will-change-transform transition-transform duration-100 ease-out"
          style={{ transform: `translate3d(0, ${rightTranslateY}px, 0)` }}
        >
          {rightFilmstripPhotos.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedPhoto(item.src)}
              className="group relative rounded-2xl overflow-hidden border border-[#C6A356]/30 bg-[#12151A] cursor-pointer shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
            >
              <img 
                src={item.src} 
                alt={item.caption} 
                className="w-full aspect-[4/3] object-cover filter brightness-[0.80] contrast-[1.08] group-hover:brightness-100 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10]/95 via-[#0B0D10]/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="text-[9px] tracking-[0.28em] uppercase text-[#C6A356] font-semibold block">
                  {item.tag}
                </span>
                <p className="font-['Marcellus',serif] text-sm text-[#FBF3E4] font-normal mt-0.5 truncate">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}

          {/* Right Panel Grand Art Deco Closing Crest Card (Mengisi bagian bawah secara bermakna) */}
          <div className="relative p-6 rounded-2xl border-2 border-[#C6A356]/40 bg-[#12151A]/95 text-center text-[#FBF3E4] shadow-2xl space-y-4">
            <div className="absolute top-2 left-2"><ArtDecoCorner position="tl" /></div>
            <div className="absolute top-2 right-2"><ArtDecoCorner position="tr" /></div>
            <div className="absolute bottom-2 left-2"><ArtDecoCorner position="bl" /></div>
            <div className="absolute bottom-2 right-2"><ArtDecoCorner position="br" /></div>

            <div className="flex justify-center pt-2">
              <ArtDecoSunburst className="w-16 h-8 text-[#C6A356]" />
            </div>

            <div className="space-y-1">
              <p className="text-[9px] tracking-[0.35em] uppercase text-[#C6A356] font-semibold">
                THE GRAND RECEPTION
              </p>
              <h4 className="font-['Marcellus',serif] text-lg text-[#FBF3E4]">
                {resepsiVenue}
              </h4>
              <p className="text-xs text-[#EDE3C8]/70 tracking-widest font-mono">
                {eventDateFormatted}
              </p>
            </div>

            <div className="pt-2 border-t border-[#C6A356]/25">
              <p className="text-[10px] italic text-[#C6A356]/90 font-['Marcellus',serif]">
                &ldquo;A little party never killed nobody.&rdquo;
              </p>
              <p className="text-[8px] tracking-[0.2em] uppercase text-[#FBF3E4]/40 mt-1">
                F. SCOTT FITZGERALD
              </p>
            </div>
          </div>
        </div>

        {/* Top & Bottom Vignettes */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#0B0D10] via-[#0B0D10]/80 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/90 to-transparent pointer-events-none z-10" />

        {/* Live Countdown Clock Widget on Right Panel */}
        <div className="absolute top-6 left-6 right-6 z-20 p-3.5 rounded-xl bg-[#12151A]/95 backdrop-blur-md border border-[#C6A356]/40 shadow-2xl">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#C6A356]/20">
            <span className="text-[8px] tracking-[0.25em] uppercase text-[#C6A356] font-semibold flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#C6A356]" />
              <span>Hitung Mundur</span>
            </span>
            <span className="text-[9px] text-[#EDE3C8]/70 font-mono">
              {timeLeft.isExpired ? 'Hari Bahagia' : 'Menuju Hari H'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="p-1.5 bg-[#0B0D10]/80 border border-[#C6A356]/30 rounded">
              <span className="block font-['Marcellus',serif] text-base text-[#C6A356] font-bold tabular-nums">
                <TickDigit value={timeLeft.days} />
              </span>
              <span className="text-[8px] uppercase tracking-wider text-[#EDE3C8]/60">Hari</span>
            </div>
            <div className="p-1.5 bg-[#0B0D10]/80 border border-[#C6A356]/30 rounded">
              <span className="block font-['Marcellus',serif] text-base text-[#C6A356] font-bold tabular-nums">
                <TickDigit value={timeLeft.hours} />
              </span>
              <span className="text-[8px] uppercase tracking-wider text-[#EDE3C8]/60">Jam</span>
            </div>
            <div className="p-1.5 bg-[#0B0D10]/80 border border-[#C6A356]/30 rounded">
              <span className="block font-['Marcellus',serif] text-base text-[#C6A356] font-bold tabular-nums">
                <TickDigit value={timeLeft.mins} />
              </span>
              <span className="text-[8px] uppercase tracking-wider text-[#EDE3C8]/60">Menit</span>
            </div>
            <div className="p-1.5 bg-[#0B0D10]/80 border border-[#C6A356]/30 rounded">
              <span className="block font-['Marcellus',serif] text-base text-[#C6A356] font-bold tabular-nums">
                <TickDigit value={timeLeft.secs} />
              </span>
              <span className="text-[8px] uppercase tracking-wider text-[#EDE3C8]/60">Detik</span>
            </div>
          </div>
        </div>

        {/* Floating Quick Section Navigator on Right Panel */}
        <div className="absolute top-36 right-4 z-20 flex flex-col items-end gap-1 p-2.5 rounded-xl bg-[#12151A]/95 backdrop-blur-md border border-[#C6A356]/35 shadow-2xl">
          <span className="text-[8px] tracking-[0.25em] uppercase text-[#C6A356] font-semibold mb-1 px-1">
            Navigasi
          </span>
          <div className="flex flex-col gap-0.5 max-h-[52vh] overflow-y-auto pr-0.5 scrollbar-thin">
            {SECTIONS.map((sec, idx) => {
              const isActive = activeSectionId === sec.id;
              const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'][idx] || sec.number;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className="group flex items-center justify-end gap-2 py-0.5 px-1.5 rounded transition-all cursor-pointer hover:bg-[#C6A356]/15"
                  title={`${sec.label} (${sec.number})`}
                >
                  <span className={`text-[9px] tracking-wider transition-all hidden xl:inline ${
                    isActive 
                      ? 'text-[#C6A356] font-semibold' 
                      : 'text-[#EDE3C8]/40 group-hover:text-[#EDE3C8]/80'
                  }`}>
                    {sec.label}
                  </span>
                  <span className={`font-mono text-[9px] px-1 py-0.2 rounded transition-all ${
                    isActive 
                      ? 'bg-[#C6A356] text-[#0B0D10] font-bold shadow-xs' 
                      : 'text-[#C6A356]/60 group-hover:text-[#C6A356]'
                  }`}>
                    {roman}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ============================================================
          SAMPUL / AMPLOP GERBANG PEMBUKA (Art Deco 3D Luxury Envelope)
          Tampil pertama kali saat tamu menerima undangan.
          Saat "Buka Undangan" diklik:
          1. Flap amplop melipat ke atas secara 3D (3D fold open)
          2. Segel medali emas Art Deco memancarkan kilau dan terlepas
          3. Amplop meluncur menyingkap kartu undangan resmi Section 1
          ============================================================ */}
      {!isCoverDismissed && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0B0D10] overflow-hidden transition-all duration-1000 ease-in-out ${
            isOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
          style={{ perspective: '1200px' }}
        >
          {/* Ambient Drifting Gold Dust (Pure Deterministic CSS) */}
          <GoldDust count={16} />

          {/* Cover background with luxury vignette */}
          {isCoverVideo ? (
            <video
              key={heroVideoUrl}
              src={heroVideoUrl}
              poster={heroImage}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.40] scale-105 pointer-events-none"
            />
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center filter brightness-[0.40] scale-105 zz-kenburns"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10]/95 via-[#0B0D10]/80 to-[#0B0D10]/90" />

          {/* The Art Deco Envelope Pocket Body */}
          <div className="relative z-10 w-full max-w-[420px] mx-auto rounded-2xl bg-[#12151A] border-2 border-[#C6A356]/60 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="absolute top-2 left-2 z-30 pointer-events-none"><ArtDecoCorner position="tl" /></div>
            <div className="absolute top-2 right-2 z-30 pointer-events-none"><ArtDecoCorner position="tr" /></div>
            <div className="absolute bottom-2 left-2 z-30 pointer-events-none"><ArtDecoCorner position="bl" /></div>
            <div className="absolute bottom-2 right-2 z-30 pointer-events-none"><ArtDecoCorner position="br" /></div>
            
            {/* Top 3D Envelope Flap (Geometric Art Deco Chevron that folds open upward) */}
            <div 
              className={`relative z-20 origin-top transition-transform duration-700 ease-in-out ${
                isOpeningFlap ? '[transform:rotateX(-175deg)]' : '[transform:rotateX(0deg)]'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Flap Outer Graphic */}
              <div className="relative bg-gradient-to-b from-[#1C222B] to-[#12151A] pt-6 pb-9 px-6 border-b border-[#C6A356]/40 shadow-md text-center">
                <p className="uppercase tracking-[0.35em] text-[9px] font-semibold text-[#C6A356]">
                  UNDANGAN PERNIKAHAN RESMI
                </p>
                
                {/* Flap downward pointer peak */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#12151A] border-r border-b border-[#C6A356]/40 rotate-45" />

                {/* Golden Wax Seal Medallion with pulsing glow */}
                <button
                  type="button"
                  onClick={handleOpenInvitation}
                  disabled={isOpeningFlap}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-[#C6A356] bg-gradient-to-br from-[#E2C785] via-[#C6A356] to-[#8F702F] text-[#0B0D10] font-['Marcellus',serif] font-bold text-sm flex items-center justify-center cursor-pointer shadow-xl zz-seal active:scale-95 transition-transform z-30"
                  title="Sentuh segel untuk membuka undangan"
                  aria-label="Buka undangan pernikahan"
                >
                  <span className="tracking-tighter">{brideName[0]}&amp;{groomName[0]}</span>
                </button>
              </div>
            </div>

            {/* Inner Envelope Content / Card Pocket Area */}
            <div className="relative p-6 sm:p-8 pt-8 text-center text-[#FBF3E4] space-y-6">
              
              <div className="flex justify-center pt-2">
                <ArtDecoSunburst className="w-16 h-8 text-[#C6A356]" />
              </div>

              {/* Monogram & Title */}
              <div className="space-y-1">
                <h1 className="font-['Marcellus',serif] text-3xl sm:text-4xl text-[#FBF3E4] font-normal tracking-tight">
                  {brideName} &amp; {groomName}
                </h1>
                <p className="font-['Marcellus',serif] italic text-xs text-[#EDE3C8]/85 max-w-xs mx-auto leading-relaxed">
                  Dengan penuh sukacita, kami mengundang Anda menjadi saksi janji suci di malam yang istimewa.
                </p>
              </div>

              {!hideGuestName && guestName && (
                <div className="py-2.5 px-4 border-y border-[#C6A356]/30 max-w-xs mx-auto">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#C6A356] font-semibold">
                    Kepada Yth.
                  </p>
                  <p className="font-['Marcellus',serif] text-base text-[#FBF3E4] mt-0.5">
                    {guestName}
                  </p>
                </div>
              )}

              {/* Bottom Medallion Ray Button */}
              <div className="pt-2">
                <button
                  onClick={handleOpenInvitation}
                  disabled={isOpeningFlap}
                  className="group relative inline-flex items-center justify-center px-9 py-3.5 rounded-full bg-[#C6A356] hover:bg-[#d6b467] text-[#0B0D10] shadow-[0_10px_35px_rgba(198,163,86,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer font-semibold text-xs tracking-wider uppercase zz-shimmer"
                >
                  <span>Buka Undangan</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          CENTRAL STAGE (Mobile-simulated 480px Column)
          Art Deco Evening Warm Ivory (#EDE3C8)
          ============================================================ */}
      <div className="relative z-20 max-w-[480px] w-full mx-auto bg-[#EDE3C8] shadow-[0_0_80px_rgba(0,0,0,0.7)] overflow-hidden min-h-screen pt-0">
        
        {/* ============================================================
            SECTION 1: VIDEO HERO & NAMA MEMPELAI (DENGAN EFEK PARALAKS)
            Background video cinematic nuansa ballroom malam dengan efek paralaks,
            hanya menampilkan nama kedua mempelai secara minimalis & anggun.
            ============================================================ */}
        <section 
          id="hero-video"
          className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-center items-center text-center p-6 overflow-hidden bg-[#0B0D10]"
        >
          {/* Parallax Video or Photo Background */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none will-change-transform"
            style={{
              transform: `translate3d(0, ${scrollY * 0.32}px, 0) scale(1.15)`,
            }}
          >
            {heroVideoUrl ? (
              <video
                key={heroVideoUrl}
                src={heroVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                poster={heroImage}
                className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.10]"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            ) : heroImage ? (
              <img
                src={heroImage}
                alt={`${brideName} & ${groomName}`}
                className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.10] zz-kenburns"
              />
            ) : null}
          </div>

          {/* Vignette Gradients for Luxury Art Deco Onyx & Emerald Ambiance */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/25 to-[#0B0D10]/70 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0B0D10]/20 to-[#0B0D10]/80 pointer-events-none" />

          {/* Center Floating Text (Only Names & Pure Minimalist Elegance with subtle Parallax) */}
          <div 
            className="relative z-10 w-full max-w-sm mx-auto p-6 sm:p-8 text-center text-[#FBF3E4] space-y-4 will-change-transform border border-[#C6A356]/30 bg-[#0B0D10]/55 backdrop-blur-[2px] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            style={{
              transform: `translate3d(0, ${scrollY * 0.12}px, 0)`,
            }}
          >
            {/* Subtle Art Deco Frame Accent */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#C6A356]/70 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#C6A356]/70 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#C6A356]/70 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#C6A356]/70 pointer-events-none" />

            {/* Art Deco Monogram Crest Medallion & Radiating Sunburst */}
            <Reveal variant="rays" as="div" className="flex flex-col items-center justify-center gap-2 mb-1">
              <div className="w-12 h-12 rounded-full border border-[#C6A356]/80 flex items-center justify-center bg-[#0B0D10]/80 shadow-[0_0_25px_rgba(198,163,86,0.25)] text-[#C6A356] font-['Marcellus',serif] text-sm tracking-widest">
                {brideName[0]}&amp;{groomName[0]}
              </div>
              <ArtDecoSunburst className="zz-sunburst w-24 h-12 text-[#C6A356]" />
            </Reveal>

            <p className="text-[10px] sm:text-xs tracking-[0.42em] uppercase text-[#C6A356] font-semibold">
              THE WEDDING OF
            </p>

            <Reveal variant="blur" delay={450}>
              <h1 className="font-['Marcellus',serif] text-4xl sm:text-5xl text-[#FBF3E4] font-normal tracking-tight drop-shadow-xl leading-tight">
                {brideName} &amp; {groomName}
              </h1>
            </Reveal>

            <div className="flex items-center justify-center gap-3 py-1">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#C6A356]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A356] shadow-[0_0_8px_#C6A356]" />
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#C6A356]" />
            </div>

            <p className="font-['Marcellus',serif] text-xs sm:text-sm text-[#EDE3C8]/90 tracking-[0.25em] uppercase">
              {eventDateFormatted}
            </p>

            {/* Scroll Indicator */}
            <button
              type="button"
              onClick={() => scrollToSection('couple')}
              className="pt-6 flex flex-col items-center gap-1.5 text-[#C6A356] text-[10px] tracking-widest uppercase hover:text-white transition-colors cursor-pointer group mx-auto"
            >
              <span className="group-hover:tracking-[0.2em] transition-all">Gulir ke Bawah</span>
              <ChevronDown className="w-4 h-4 animate-bounce text-[#C6A356]" />
            </button>
          </div>
        </section>

        {/* SECTION 2: PROFIL MEMPELAI & KELUARGA BESAR */}
        <section 
          id="couple"
          className="relative min-h-[92vh] flex flex-col justify-center items-center text-center p-6 sm:p-8 bg-[#EDE3C8] text-[#181512] overflow-hidden"
        >
          {/* Main Art Deco Parchment Card */}
          <div className="relative w-full max-w-sm mx-auto p-6 sm:p-8 bg-[#FBF3E4] border-2 border-[#C6A356] shadow-2xl space-y-6">
            
            {/* Authentic Stepped Art Deco Corners */}
            <div className="absolute top-2 left-2 z-10 pointer-events-none"><ArtDecoCorner position="tl" /></div>
            <div className="absolute top-2 right-2 z-10 pointer-events-none"><ArtDecoCorner position="tr" /></div>
            <div className="absolute bottom-2 left-2 z-10 pointer-events-none"><ArtDecoCorner position="bl" /></div>
            <div className="absolute bottom-2 right-2 z-10 pointer-events-none"><ArtDecoCorner position="br" /></div>

            {/* Art Deco Sunburst Arch Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <ArtDecoSunburst className="w-16 h-8 text-[#C6A356]" />
              </div>
              <p className="text-[9px] tracking-[0.35em] uppercase text-[#1E4438] font-bold">
                KAMI YANG BERBAHAGIA
              </p>
              <h2 className="font-['Marcellus',serif] text-2xl sm:text-3xl text-[#181512]">
                Mempelai &amp; Keluarga
              </h2>
              <p className="font-['Marcellus',serif] italic text-xs text-[#8C4A36] font-medium">
                Assalamu’alaikum Warahmatullahi Wabarakatuh
              </p>
              <p className="text-xs text-[#181512]/85 leading-relaxed font-light max-w-xs mx-auto">
                Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta’ala, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam hari bahagia pernikahan kami:
              </p>
            </div>

            {/* Direct Couple & Parents Presentation */}
            <div className="space-y-6 pt-2">
              
              {/* 1. MEMPELAI WANITA */}
              <div className="space-y-3.5 bg-[#EDE3C8]/50 p-5 rounded-2xl border border-[#C6A356]/40 shadow-xs text-center transition-all hover:border-[#C6A356] group/card">
                {/* Bridal Portrait in Oval Brass Frame with Iris Reveal and Lightbox Hint */}
                <Reveal variant="iris" as="div" className="w-32 h-40 mx-auto">
                  <div 
                    onClick={() => setSelectedPhoto(bridePortrait)}
                    className="relative w-32 h-40 mx-auto rounded-full overflow-hidden border-2 border-[#C6A356] shadow-lg p-1 bg-white cursor-pointer group"
                    title="Sentuh untuk memperbesar foto"
                  >
                    <img 
                      src={bridePortrait} 
                      alt={brideFullName} 
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#0B0D10]/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <span className="p-2 rounded-full bg-[#12151A]/80 border border-[#C6A356]/60 text-[#C6A356] shadow-md">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Reveal>

                <div>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#1E4438] font-bold block mb-0.5">
                    Mempelai Wanita
                  </span>
                  <h3 className="font-['Marcellus',serif] text-2xl text-[#181512]">
                    {brideFullName}
                  </h3>
                </div>

                {/* Parents Info Directly Under Name */}
                <div className="pt-2.5 border-t border-[#C6A356]/30 space-y-0.5">
                  <p className="text-[10px] tracking-wider uppercase text-[#8C4A36] font-semibold">
                    Keluarga Mempelai Wanita:
                  </p>
                  <p className="text-xs text-[#181512] font-medium leading-relaxed">
                    {brideParents}
                  </p>
                </div>

                {brideInstagram && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#EDE3C8]/80 text-[10px] text-[#1E4438] font-medium border border-[#C6A356]/30">
                      <span>{brideInstagram}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* ART DECO AMPERSAND MEDALLION */}
              <div className="py-0.5 relative">
                <ArtDecoDivider className="my-2 text-[#C6A356]" />
                <div className="flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full border border-[#C6A356] bg-[#FBF3E4] shadow-md flex items-center justify-center text-[#C6A356] font-['Marcellus',serif] italic text-xl -mt-5 z-10">
                    &amp;
                  </div>
                </div>
              </div>

              {/* 2. MEMPELAI PRIA */}
              <div className="space-y-3.5 bg-[#EDE3C8]/50 p-5 rounded-2xl border border-[#C6A356]/40 shadow-xs text-center transition-all hover:border-[#C6A356] group/card">
                {/* Groom Portrait in Oval Brass Frame with Iris Reveal and Lightbox Hint */}
                <Reveal variant="iris" as="div" className="w-32 h-40 mx-auto">
                  <div 
                    onClick={() => setSelectedPhoto(groomPortrait)}
                    className="relative w-32 h-40 mx-auto rounded-full overflow-hidden border-2 border-[#C6A356] shadow-lg p-1 bg-white cursor-pointer group"
                    title="Sentuh untuk memperbesar foto"
                  >
                    <img 
                      src={groomPortrait} 
                      alt={groomFullName} 
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#0B0D10]/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <span className="p-2 rounded-full bg-[#12151A]/80 border border-[#C6A356]/60 text-[#C6A356] shadow-md">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Reveal>

                <div>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#1E4438] font-bold block mb-0.5">
                    Mempelai Pria
                  </span>
                  <h3 className="font-['Marcellus',serif] text-2xl text-[#181512]">
                    {groomFullName}
                  </h3>
                </div>

                {/* Parents Info Directly Under Name */}
                <div className="pt-2.5 border-t border-[#C6A356]/30 space-y-0.5">
                  <p className="text-[10px] tracking-wider uppercase text-[#8C4A36] font-semibold">
                    Keluarga Mempelai Pria:
                  </p>
                  <p className="text-xs text-[#181512] font-medium leading-relaxed">
                    {groomParents}
                  </p>
                </div>

                {groomInstagram && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#EDE3C8]/80 text-[10px] text-[#1E4438] font-medium border border-[#C6A356]/30">
                      <span>{groomInstagram}</span>
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Quick Glance Date & Venue Badge */}
            <div className="py-2.5 px-4 bg-[#EDE3C8]/70 border border-[#C6A356]/40 rounded-lg text-center">
              <p className="text-xs font-semibold text-[#181512]">{eventDateFormatted}</p>
              <p className="text-[11px] text-[#1E4438] font-medium">{resepsiVenue} · {city}</p>
            </div>

            {/* Scroll Indicator */}
            <div className="flex flex-col items-center gap-1 text-[#8C4A36] text-[10px] uppercase tracking-widest pt-1">
              <span>Lanjut ke Rangkaian Acara</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#8C4A36]" />
            </div>

          </div>
        </section>

        {/* SECTION 2: SALAM PEMBUKA (Pantun Melati & Kipas Art Deco) */}
        <section id="salam" className="py-20 px-6 sm:px-8 text-center bg-[#EDE3C8] border-b border-[#C6A356]/30">
          <div className="flex justify-center mb-6">
            <ArtDecoSunburst className="w-24 h-12 text-[#C6A356]" />
          </div>
          <Reveal variant="blur" as="p" className="font-['Marcellus',serif] italic text-base sm:text-lg leading-relaxed text-[#181512] max-w-sm mx-auto">
            &ldquo;{quoteText}&rdquo;
          </Reveal>
          {quoteSource && (
            <p className="text-[10px] tracking-widest uppercase text-[#8C4A36] font-semibold mt-3">
              — {quoteSource}
            </p>
          )}
        </section>

        {/* SECTION 3: WAKTU & TEMPAT (Onyx & Brass Countdown) */}
        <section id="datetime" className="py-20 px-6 sm:px-8 bg-[#12151A] text-[#FBF3E4] text-center">
          <p className="uppercase tracking-[0.34em] text-[10px] font-semibold text-[#C6A356] mb-2">
            SIMPAN TANGGALNYA
          </p>
          <h3 className="font-['Marcellus',serif] text-3xl text-[#FBF3E4] mb-2">
            {eventDateFormatted}
          </h3>
          <p className="text-xs text-[#EDE3C8]/80 max-w-xs mx-auto mb-10 leading-relaxed font-light">
            Malam resepsi bernuansa elegan di bawah kilau lampu temaram
          </p>

          {/* Stepped Art Deco Countdown Boxes with Chronometer Hairlines */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-10">
            <div className="relative group min-w-[66px] sm:min-w-[72px] py-3.5 px-2 border border-[#C6A356]/60 bg-gradient-to-b from-[#181C22] to-[#0B0D10] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-xs">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C6A356]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C6A356]" />
              <span className="block font-['Marcellus',serif] text-2xl sm:text-3xl text-[#C6A356] font-bold tabular-nums">
                <TickDigit value={timeLeft.days} />
              </span>
              <small className="text-[9px] tracking-widest uppercase text-[#FBF3E4]/60 font-medium">Hari</small>
            </div>
            <div className="relative group min-w-[66px] sm:min-w-[72px] py-3.5 px-2 border border-[#C6A356]/60 bg-gradient-to-b from-[#181C22] to-[#0B0D10] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-xs">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C6A356]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C6A356]" />
              <span className="block font-['Marcellus',serif] text-2xl sm:text-3xl text-[#C6A356] font-bold tabular-nums">
                <TickDigit value={timeLeft.hours} />
              </span>
              <small className="text-[9px] tracking-widest uppercase text-[#FBF3E4]/60 font-medium">Jam</small>
            </div>
            <div className="relative group min-w-[66px] sm:min-w-[72px] py-3.5 px-2 border border-[#C6A356]/60 bg-gradient-to-b from-[#181C22] to-[#0B0D10] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-xs">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C6A356]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C6A356]" />
              <span className="block font-['Marcellus',serif] text-2xl sm:text-3xl text-[#C6A356] font-bold tabular-nums">
                <TickDigit value={timeLeft.mins} />
              </span>
              <small className="text-[9px] tracking-widest uppercase text-[#FBF3E4]/60 font-medium">Menit</small>
            </div>
            <div className="relative group min-w-[66px] sm:min-w-[72px] py-3.5 px-2 border border-[#C6A356]/60 bg-gradient-to-b from-[#181C22] to-[#0B0D10] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-xs">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C6A356]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C6A356]" />
              <span className="block font-['Marcellus',serif] text-2xl sm:text-3xl text-[#C6A356] font-bold tabular-nums">
                <TickDigit value={timeLeft.secs} />
              </span>
              <small className="text-[9px] tracking-widest uppercase text-[#FBF3E4]/60 font-medium">Detik</small>
            </div>
          </div>

          {/* Schedule Cards */}
          <div className="grid gap-4 max-w-xs mx-auto text-left mb-8">
            <div className="border border-[#C6A356]/40 p-5 bg-[#0B0D10]/70 relative group hover:border-[#C6A356] transition-colors">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#C6A356]/20 text-[#C6A356] text-[9px] uppercase tracking-wider font-semibold border-b border-l border-[#C6A356]/30">
                Khidmat
              </div>
              <p className="text-[10px] tracking-widest uppercase text-[#C6A356] font-semibold mb-1">Akad Nikah</p>
              <p className="font-['Marcellus',serif] text-xl text-[#FBF3E4]">{akadTime}</p>
              <p className="text-xs text-[#EDE3C8]/70 mt-1">{akadVenue}</p>
            </div>

            <div className="border border-[#C6A356]/40 p-5 bg-[#0B0D10]/70 relative group hover:border-[#C6A356] transition-colors">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#C6A356]/20 text-[#C6A356] text-[9px] uppercase tracking-wider font-semibold border-b border-l border-[#C6A356]/30">
                Perayaan
              </div>
              <p className="text-[10px] tracking-widest uppercase text-[#C6A356] font-semibold mb-1">Resepsi</p>
              <p className="font-['Marcellus',serif] text-xl text-[#FBF3E4]">{resepsiTime}</p>
              <p className="text-xs text-[#EDE3C8]/70 mt-1">{resepsiVenue}</p>
            </div>
          </div>

          {/* Calendar & Copy Schedule Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xs mx-auto">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C6A356] hover:bg-[#b59247] text-[#0B0D10] text-xs font-semibold rounded-full shadow-md transition-all active:scale-95 zz-shimmer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Simpan ke Kalender</span>
            </a>

            <button
              type="button"
              onClick={handleCopySchedule}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#C6A356]/60 hover:bg-[#C6A356]/20 text-[#FBF3E4] text-xs font-medium rounded-full transition-all active:scale-95 cursor-pointer"
            >
              {isCopied('event-schedule') ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C6A356]" />
                  <span className="text-[#C6A356] zz-pop">Rincian Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C6A356]" />
                  <span>Salin Jadwal</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* SECTION 4: LOKASI & PETA */}
        <section id="lokasi" className="relative min-h-[64vh] flex items-end overflow-hidden bg-[#0B0D10]">
          {(spotlightImage || galleryImages[1] || galleryImages[0] || heroImage) && (
            <img 
              src={spotlightImage || galleryImages[1] || galleryImages[0] || heroImage} 
              alt={resepsiVenue} 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.70]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent" />
          
          <div className="relative z-10 w-full p-6 sm:p-8 text-center text-[#FBF3E4] space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0D10]/80 border border-[#C6A356]/40 text-[#C6A356] text-[10px] uppercase tracking-widest font-semibold mb-1">
              <MapPin className="w-3 h-3" />
              <span>Lokasi Acara</span>
            </div>

            <h4 className="font-['Marcellus',serif] text-2xl sm:text-3xl text-[#FBF3E4]">
              {resepsiVenue}
            </h4>
            <p className="text-xs text-[#EDE3C8]/85 max-w-xs mx-auto leading-relaxed">
              {city}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-xs mx-auto">
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C6A356] hover:bg-[#b59247] text-[#0B0D10] px-5 py-2.5 text-xs font-semibold rounded-full shadow-md transition-all active:scale-95"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 text-[#0B0D10]/70" />
              </a>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border border-[#C6A356] hover:bg-[#C6A356]/20 text-[#FBF3E4] px-4 py-2.5 text-xs rounded-full transition-all active:scale-95 cursor-pointer"
              >
                {isCopied('venue-address') ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#C6A356]" />
                    <span className="text-[#C6A356] zz-pop">Alamat Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C6A356]" />
                    <span>Salin Alamat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 5: SPOTLIGHT 1 */}
        <section id="spotlight-1" className="relative min-h-[68vh] flex items-end overflow-hidden bg-[#0B0D10]">
          {(spotlightImage || galleryImages[0] || heroImage) && (
            <img 
              src={spotlightImage || galleryImages[0] || heroImage} 
              alt="Spotlight 1" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.75]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/35 to-transparent" />
          <div className="relative z-10 w-full p-8 text-center text-[#FBF3E4]">
            <Reveal variant="blur" as="p" className="font-['Marcellus',serif] italic text-lg sm:text-xl leading-relaxed max-w-xs mx-auto">
              &ldquo;Di bawah lampu temaram, dua bayangan menjadi satu.&rdquo;
            </Reveal>
          </div>
        </section>

        {/* SECTION 6: TURUT MENGUNDANG */}
        <section id="turut" className="py-16 px-6 sm:px-8 bg-[#1E4438] text-[#FBF3E4] text-center">
          <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-[#C6A356] mb-3">
            TURUT MENGUNDANG
          </p>
          <p className="text-xs sm:text-sm leading-relaxed max-w-xs mx-auto font-light text-[#FBF3E4]/90">
            Keluarga Besar kedua mempelai turut mengundang Bapak/Ibu/Saudara/i untuk berkenan hadir dan memberikan doa restu.
          </p>
        </section>

        {/* SECTION 8: KISAH KAMI (Our Story Timeline) */}
        {storyMilestones.length > 0 && (
          <section id="our-story" className="py-20 px-6 sm:px-8 bg-[#EDE3C8]">
            <h3 className="font-['Marcellus',serif] text-3xl text-center text-[#181512] mb-12">
              Kisah Cinta Kami
            </h3>

            <Reveal variant="none" as="div" className="relative max-w-xs mx-auto pl-6 space-y-10 text-left">
              {/* Dynamic Animated Line */}
              <span className="zz-line" />

              {storyMilestones.map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#8C4A36] zz-dot" />
                  <span className="text-[10px] tracking-widest uppercase text-[#1E4438] block mb-1 font-semibold">
                    {item.date || item.chapter}
                  </span>
                  <h4 className="font-['Marcellus',serif] text-lg text-[#181512] mb-1">
                    {item.title}
                  </h4>
                  {item.image && (
                    <div
                      onClick={() => setSelectedPhoto(item.image)}
                      className="my-2.5 rounded-lg overflow-hidden border border-[#8C4A36]/30 cursor-pointer shadow-sm"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  {item.quote && (
                    <p className="text-xs italic text-[#8C4A36] mb-1">{item.quote}</p>
                  )}
                  <p className="text-xs text-[#181512]/85 leading-relaxed">
                    {item.story}
                  </p>
                </div>
              ))}
            </Reveal>
          </section>
        )}

        {/* SECTION 9: DRESS CODE (Ketentuan Busana & Interactive Swatches) */}
        <section id="dresscode" className="py-20 px-6 sm:px-8 bg-[#12151A] text-[#FBF3E4] text-center">
          <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-[#C6A356] mb-2">
            KETENTUAN BUSANA
          </p>
          <h3 className="font-['Marcellus',serif] text-3xl text-[#FBF3E4] mb-3">
            Art Deco Evening Attire
          </h3>
          <p className="text-xs text-[#EDE3C8]/85 leading-relaxed max-w-xs mx-auto mb-7 font-light">
            Kami mengundang Anda mengenakan busana bernuansa hangat Art Deco. Sentuh palet warna di bawah untuk panduan inspirasi gaya busana.
          </p>

          {/* Interactive Color Swatches */}
          <div className="flex justify-center gap-4 sm:gap-6 flex-wrap mb-6">
            {(Object.keys(SWATCH_DETAILS) as Array<keyof typeof SWATCH_DETAILS>).map((key, idx) => {
              const swatch = SWATCH_DETAILS[key];
              const isActive = activeSwatch === key;
              return (
                <Reveal key={key} variant="zoom" delay={idx * 90} as="div">
                  <button
                    type="button"
                    onClick={() => setActiveSwatch(key)}
                    className="flex flex-col items-center gap-2 group cursor-pointer transition-all active:scale-95"
                  >
                    <div 
                      className={`relative w-11 h-11 rounded-full border transition-all duration-300 shadow-md flex items-center justify-center ${
                        isActive 
                          ? 'ring-2 ring-[#C6A356] ring-offset-2 ring-offset-[#12151A] scale-110 shadow-[0_0_15px_rgba(198,163,86,0.5)] border-white' 
                          : 'border-[#FBF3E4]/30 opacity-70 group-hover:opacity-100 group-hover:scale-105'
                      }`}
                      style={{ background: swatch.color }}
                    >
                      {isActive && (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: swatch.textColor }} />
                      )}
                    </div>
                    <span className={`text-[10px] tracking-wider uppercase transition-colors ${isActive ? 'text-[#C6A356] font-bold' : 'text-[#EDE3C8]/70'}`}>
                      {swatch.name.split(' ')[0]}
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Dynamic Style Recommendation Card */}
          <div className="relative max-w-xs mx-auto p-5 border border-[#C6A356]/40 bg-[#0B0D10]/85 text-left shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: SWATCH_DETAILS[activeSwatch].color }} />
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#C6A356]/20">
              <div>
                <span className="font-['Marcellus',serif] text-base text-[#FBF3E4] block">
                  {SWATCH_DETAILS[activeSwatch].name}
                </span>
                <span className="text-[10px] text-[#EDE3C8]/60 font-mono">
                  {SWATCH_DETAILS[activeSwatch].subtitle}
                </span>
              </div>
              <span className="text-[9px] px-2.5 py-0.5 rounded-full border border-[#C6A356]/40 text-[#C6A356] bg-[#C6A356]/10 uppercase tracking-widest font-semibold">
                {SWATCH_DETAILS[activeSwatch].badge}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C6A356] font-semibold block mb-0.5">
                  Wanita (Ladies):
                </span>
                <p className="text-[#EDE3C8]/85 leading-relaxed font-light">
                  {SWATCH_DETAILS[activeSwatch].forLadies}
                </p>
              </div>

              <div className="pt-2 border-t border-[#C6A356]/15">
                <span className="text-[10px] uppercase tracking-wider text-[#C6A356] font-semibold block mb-0.5">
                  Pria (Gentlemen):
                </span>
                <p className="text-[#EDE3C8]/85 leading-relaxed font-light">
                  {SWATCH_DETAILS[activeSwatch].forGentlemen}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: SPOTLIGHT 2 */}
        <section id="spotlight-2" className="relative min-h-[64vh] flex items-end overflow-hidden bg-[#0B0D10]">
          {(galleryImages[2] || spotlightImage || galleryImages[0] || heroImage) && (
            <img 
              src={galleryImages[2] || spotlightImage || galleryImages[0] || heroImage} 
              alt="Spotlight 2" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.72]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/35 to-transparent" />
          <div className="relative z-10 w-full p-8 text-center text-[#FBF3E4]">
            <Reveal variant="blur" as="p" className="font-['Marcellus',serif] italic text-lg sm:text-xl leading-relaxed max-w-xs mx-auto">
              &ldquo;Dua hati yang memilih untuk terus melangkah bersama.&rdquo;
            </Reveal>
          </div>
        </section>

        {/* SECTION 11: GALERI (Photo Carousel & Grid Tanpa Batas) */}
        {galleryImages.length > 0 && (
          <section id="gallery" className="py-20 bg-[#EDE3C8]">
            <h3 className="font-['Marcellus',serif] text-3xl text-center text-[#181512] mb-8">
              Galeri Momen
            </h3>

            <div className="relative px-6">
              <div 
                onClick={() => setSelectedPhoto(galleryImages[carouselIndex] || galleryImages[0])}
                className="relative aspect-3/4 max-w-[320px] mx-auto overflow-hidden border border-[#8C4A36]/40 shadow-2xl cursor-pointer group bg-[#12151A]"
              >
                <img 
                  key={carouselIndex}
                  src={galleryImages[carouselIndex] || galleryImages[0]} 
                  alt={`Galeri foto ${carouselIndex + 1}`} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 zz-fade"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-[#FBF3E4] bg-[#0B0D10]/80 px-4 py-1.5 rounded-full border border-[#C6A356]/40">
                    Perbesar Foto
                  </span>
                </div>
              </div>

              {/* Carousel Navigation Buttons */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={prevSlide}
                  disabled={carouselIndex === 0}
                  className="w-10 h-10 rounded-full border border-[#8C4A36]/60 flex items-center justify-center text-[#8C4A36] hover:bg-[#8C4A36]/15 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-xs text-[#8C4A36] font-['Marcellus',serif]">
                  {carouselIndex + 1} / {galleryImages.length}
                </span>

                <button
                  type="button"
                  onClick={nextSlide}
                  disabled={carouselIndex === galleryImages.length - 1}
                  className="w-10 h-10 rounded-full border border-[#8C4A36]/60 flex items-center justify-center text-[#8C4A36] hover:bg-[#8C4A36]/15 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnail Grid (Mendukung jumlah foto tanpa batas) */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto mt-6">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCarouselIndex(idx)}
                      className={`relative aspect-square overflow-hidden border transition-all cursor-pointer ${
                        carouselIndex === idx
                          ? 'border-[#C6A356] ring-2 ring-[#C6A356]/60 opacity-100'
                          : 'border-[#8C4A36]/30 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 12: TANDA KASIH */}
        <section id="gift" className="py-20 px-6 sm:px-8 bg-[#EDE3C8] text-center border-t border-[#C6A356]/20">
          <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-[#C6A356] mb-2">
            TANDA KASIH
          </p>
          <h3 className="font-['Marcellus',serif] text-3xl text-[#181512] mb-6">
            Amplop Digital
          </h3>

          <div className="relative max-w-sm mx-auto border-2 border-[#C6A356]/70 p-6 sm:p-7 bg-[#FBF3E4] space-y-5 shadow-xl">
            <div className="absolute top-2 left-2 pointer-events-none"><ArtDecoCorner position="tl" /></div>
            <div className="absolute top-2 right-2 pointer-events-none"><ArtDecoCorner position="tr" /></div>
            <div className="absolute bottom-2 left-2 pointer-events-none"><ArtDecoCorner position="bl" /></div>
            <div className="absolute bottom-2 right-2 pointer-events-none"><ArtDecoCorner position="br" /></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A356] to-transparent" />
            
            <p className="text-xs text-[#181512] leading-relaxed">
              Doa restu Anda adalah karunia yang paling berarti bagi kami. Namun jika ingin memberi tanda kasih, kami dengan hormat menerima melalui:
            </p>

            {/* Primary Bank Card */}
            <div className="p-4 bg-[#EDE3C8]/70 border border-[#C6A356]/40 rounded-lg text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#1E4438] font-bold block uppercase tracking-wider">{bankName}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1E4438]/10 text-[#1E4438] font-semibold">Rekening Utama</span>
              </div>
              <p className="text-lg font-mono font-bold text-[#181512] tracking-wider">{accountNumber}</p>
              <p className="text-xs text-[#181512]">a.n. {accountHolder}</p>

              <button
                type="button"
                onClick={handleCopyAccount}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#C6A356] hover:bg-[#b59247] text-[#0B0D10] text-xs font-semibold rounded uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs mt-1 zz-shimmer"
              >
                {isCopied('bank') ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="zz-pop">Rekening Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Rekening {bankName}</span>
                  </>
                )}
              </button>
            </div>

            {/* Secondary Bank Card (if provided) */}
            {secondaryAccountNumber && (
              <div className="p-4 bg-[#EDE3C8]/70 border border-[#C6A356]/40 rounded-lg text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8C4A36] font-bold block uppercase tracking-wider">{secondaryBankName || 'Bank Cadangan'}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#8C4A36]/10 text-[#8C4A36] font-semibold">Pilihan Lain</span>
                </div>
                <p className="text-lg font-mono font-bold text-[#181512] tracking-wider">{secondaryAccountNumber}</p>
                <p className="text-xs text-[#181512]">a.n. {secondaryAccountHolder || accountHolder}</p>

                <button
                  type="button"
                  onClick={handleCopySecondaryAccount}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#8C4A36] hover:bg-[#783e2d] text-[#FBF3E4] text-xs font-semibold rounded uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs mt-1 zz-shimmer"
                >
                  {isCopied('bank-secondary') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="zz-pop">Rekening Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Rekening {secondaryBankName || 'Kedua'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* QRIS Button */}
            {qrisImageUrl && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowQrisModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#EDE3C8] hover:bg-[#ded1b3] border border-[#C6A356] text-[#181512] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#C6A356]" />
                  <span>Buka Pembayaran QRIS</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 13: GUESTBOOK (Ucapan & Doa) */}
        <section id="guestbook" className="py-20 px-6 sm:px-8 bg-[#12151A] text-[#FBF3E4]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#C6A356]" />
            <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-[#C6A356]">
              BUKU TAMU DIGITAL
            </p>
          </div>
          <h3 className="font-['Marcellus',serif] text-3xl text-center text-[#FBF3E4] mb-3">
            Ucapan &amp; Doa
          </h3>
          <p className="text-xs text-[#EDE3C8]/75 max-w-xs mx-auto text-center mb-8 font-light">
            Torehkan doa restu serta harapan hangat Anda bagi perjalanan kedua mempelai.
          </p>

          {/* Wishes List */}
          <div className="max-w-sm mx-auto mb-6 max-h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {wishes.map((w, idx) => (
              <div key={idx} className="border border-[#C6A356]/30 p-4 bg-[#0B0D10]/70 text-left rounded-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-['Marcellus',serif] text-sm text-[#C6A356]">
                    {w.name}
                  </span>
                  <span className="text-[9px] text-[#EDE3C8]/50">
                    {w.time}
                  </span>
                </div>
                <p className="text-xs text-[#FBF3E4]/90 leading-relaxed font-light">
                  {w.message}
                </p>
              </div>
            ))}
          </div>

          {/* Guestbook Form */}
          <form onSubmit={handleGuestbookSubmit} className="max-w-sm mx-auto space-y-3 text-left">
            <input
              type="text"
              placeholder="Nama Anda"
              value={guestNameInput}
              onChange={(e) => setGuestNameInput(e.target.value)}
              className="w-full bg-[#0B0D10]/60 border border-[#C6A356]/40 text-[#FBF3E4] p-3 text-xs rounded-sm focus:outline-none focus:border-[#C6A356]"
              required
            />

            <textarea
              placeholder="Tulis ucapan & doa untuk kedua mempelai"
              value={guestMsgInput}
              onChange={(e) => setGuestMsgInput(e.target.value)}
              rows={3}
              className="w-full bg-[#0B0D10]/60 border border-[#C6A356]/40 text-[#FBF3E4] p-3 text-xs rounded-sm focus:outline-none focus:border-[#C6A356] resize-none"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#C6A356] hover:bg-[#b59247] text-[#0B0D10] text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md rounded-sm zz-shimmer"
            >
              Kirim Ucapan
            </button>
          </form>
        </section>

        {/* SECTION 14: RSVP */}
        <section id="rsvp" className="py-20 px-6 sm:px-8 bg-[#EDE3C8] text-center">
          <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-[#8C4A36] mb-2">
            RESERVASI
          </p>
          <h3 className="font-['Marcellus',serif] text-3xl text-[#181512] mb-6">
            Konfirmasi Kehadiran
          </h3>

          {rsvpSuccess && (
            <div className="max-w-sm mx-auto mb-4 p-3 bg-[#1E4438]/15 border border-[#1E4438]/40 text-[#181512] text-xs rounded flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#1E4438] flex-shrink-0" />
              <span>Konfirmasi kehadiran Anda telah berhasil tersimpan.</span>
            </div>
          )}

          <form onSubmit={handleRsvpSubmit} className="max-w-sm mx-auto space-y-4 text-left bg-[#FBF3E4] p-6 border-2 border-[#C6A356]/50 shadow-lg relative">
            <div className="absolute top-1.5 left-1.5 pointer-events-none"><ArtDecoCorner position="tl" /></div>
            <div className="absolute top-1.5 right-1.5 pointer-events-none"><ArtDecoCorner position="tr" /></div>
            
            <div>
              <label className="block text-xs font-semibold text-[#181512] mb-1">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Nama Anda"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                className="w-full bg-[#EDE3C8]/40 border border-[#1E4438]/40 text-[#181512] p-2.5 text-xs rounded focus:outline-none focus:border-[#1E4438]"
                required
              />
            </div>

            {/* Tactile Art Deco Attendance Toggle Buttons */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#181512] mb-1.5">Konfirmasi Kehadiran</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRsvpAttendance('hadir')}
                  className={`p-3 rounded border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    rsvpAttendance === 'hadir'
                      ? 'bg-[#1E4438] text-[#FBF3E4] border-[#1E4438] shadow-md ring-2 ring-[#C6A356]/60'
                      : 'bg-[#EDE3C8]/60 text-[#181512] border-[#C6A356]/30 hover:border-[#1E4438]/50'
                  }`}
                >
                  <span className="font-['Marcellus',serif] text-xs font-semibold tracking-wider uppercase">Hadir</span>
                  <span className={`text-[9px] mt-0.5 tracking-tight ${rsvpAttendance === 'hadir' ? 'text-[#EDE3C8]/80' : 'text-[#181512]/60'}`}>Pasti Hadir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRsvpAttendance('ragu')}
                  className={`p-3 rounded border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    rsvpAttendance === 'ragu'
                      ? 'bg-[#C6A356] text-[#0B0D10] border-[#C6A356] shadow-md ring-2 ring-[#0B0D10]/30'
                      : 'bg-[#EDE3C8]/60 text-[#181512] border-[#C6A356]/30 hover:border-[#C6A356]'
                  }`}
                >
                  <span className="font-['Marcellus',serif] text-xs font-semibold tracking-wider uppercase">Ragu</span>
                  <span className={`text-[9px] mt-0.5 tracking-tight ${rsvpAttendance === 'ragu' ? 'text-[#0B0D10]/80' : 'text-[#181512]/60'}`}>Belum Pasti</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRsvpAttendance('tidak_hadir')}
                  className={`p-3 rounded border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    rsvpAttendance === 'tidak_hadir'
                      ? 'bg-[#8C4A36] text-[#FBF3E4] border-[#8C4A36] shadow-md ring-2 ring-[#C6A356]/60'
                      : 'bg-[#EDE3C8]/60 text-[#181512] border-[#C6A356]/30 hover:border-[#8C4A36]/50'
                  }`}
                >
                  <span className="font-['Marcellus',serif] text-xs font-semibold tracking-wider uppercase">Absen</span>
                  <span className={`text-[9px] mt-0.5 tracking-tight ${rsvpAttendance === 'tidak_hadir' ? 'text-[#EDE3C8]/80' : 'text-[#181512]/60'}`}>Berhalangan</span>
                </button>
              </div>
            </div>

            {/* Tactile Guest Count Stepper */}
            {rsvpAttendance !== 'tidak_hadir' && (
              <div>
                <label className="block text-xs font-semibold text-[#181512] mb-1.5">Jumlah Tamu</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(rsvpCount || '1', 10);
                      if (current > 1) setRsvpCount(String(current - 1));
                    }}
                    className="w-10 h-10 rounded border border-[#C6A356]/50 bg-[#EDE3C8]/80 hover:bg-[#EDE3C8] text-[#181512] font-bold text-lg flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                    aria-label="Kurangi tamu"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center py-2 border border-[#1E4438]/40 rounded bg-white font-mono text-sm font-semibold text-[#181512]">
                    {rsvpCount || '1'} Orang
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(rsvpCount || '1', 10);
                      if (current < 10) setRsvpCount(String(current + 1));
                    }}
                    className="w-10 h-10 rounded border border-[#C6A356]/50 bg-[#EDE3C8]/80 hover:bg-[#EDE3C8] text-[#181512] font-bold text-lg flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                    aria-label="Tambah tamu"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#1E4438] hover:bg-[#15332a] text-[#FBF3E4] text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer mt-2 rounded shadow-md"
            >
              Kirim Konfirmasi
            </button>
          </form>
        </section>

        {/* SECTION 15: PENUTUP */}
        <section id="closing" className="relative min-h-[78vh] flex items-center justify-center text-center p-8 overflow-hidden bg-[#0B0D10]">
          {closingImage && (
            <img 
              src={closingImage} 
              alt="Closing background" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35]"
            />
          )}
          <div className="absolute inset-0 bg-[#0B0D10]/80" />

          <div className="relative z-10 text-[#FBF3E4] space-y-4 max-w-xs">
            {/* Monogram Crest */}
            <div className="w-12 h-12 rounded-full border border-[#C6A356]/80 flex items-center justify-center bg-[#0B0D10]/80 shadow-[0_0_20px_rgba(198,163,86,0.3)] mx-auto font-['Marcellus',serif] text-sm text-[#C6A356] tracking-widest mb-2">
              {brideName[0]}&amp;{groomName[0]}
            </div>

            <div className="flex justify-center mb-3">
              <ArtDecoSunburst className="w-24 h-12 text-[#C6A356]" inverted={true} />
            </div>
            
            <p className="text-xs sm:text-sm leading-relaxed text-[#EDE3C8]/90 font-light">
              Terima kasih telah menjadi bagian dari kisah kami. Kehadiran dan doa restu Anda adalah kehormatan serta kebahagiaan terbesar bagi kami.
            </p>
            <div className="pt-2">
              <p className="font-['Marcellus',serif] text-xl text-[#FBF3E4] font-normal tracking-wide">
                {brideName} &amp; {groomName}
              </p>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C6A356]/80 font-medium pt-1">
                {resepsiVenue} · {city}
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToSection('hero-video')}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#C6A356]/40 text-[#C6A356] hover:bg-[#C6A356]/15 rounded-full text-xs transition-colors cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Kembali ke Atas</span>
              </button>

              <button
                onClick={onBackToLanding}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#C6A356]/15 hover:bg-[#C6A356]/25 border border-[#C6A356]/60 text-[#FBF3E4] rounded-full text-xs font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#C6A356]" />
                <span>Kembali ke Katalog Sekarsiti</span>
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedPhoto}
            alt="Perbesar galeri"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* QRIS Modal */}
      {showQrisModal && (
        <div 
          onClick={() => setShowQrisModal(false)}
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#EDE3C8] rounded-2xl p-6 max-w-xs w-full text-center space-y-4 text-[#181512] shadow-2xl border border-[#C6A356]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#C6A356]/30">
              <span className="font-['Marcellus',serif] text-base text-[#181512]">QRIS Tanda Kasih</span>
              <button onClick={() => setShowQrisModal(false)} className="text-[#181512]/60 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white border border-[#C6A356]/30 rounded-xl flex items-center justify-center min-h-[170px]">
              {qrisImageUrl ? (
                <img src={qrisImageUrl} alt="QRIS Tanda Kasih" className="max-w-[200px] max-h-[200px] object-contain rounded" />
              ) : (
                <QrCode className="w-40 h-40 text-stone-900" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-stone-900">{brideName} &amp; {groomName}</p>
              <p className="text-[10px] text-stone-600">Scan via BCA, Mandiri, GoPay, OVO, Dana</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
