import { useState, useEffect, useRef } from 'react';
import { safeCopyToClipboard } from '../utils/clipboardUtils';
import { sanitizeAudioUrl } from '../utils/audioUrl';
import { requestRateLimitPermit } from '../utils/requestRateLimit';

// 1. REUSABLE COUNTDOWN TIMER LOGIC
export function useCountdown(targetIsoDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    mins: '00',
    secs: '00',
    isExpired: false
  });

  useEffect(() => {
    const target = new Date(targetIsoDate).getTime();
    if (isNaN(target)) return;

    const calculate = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        mins: String(m).padStart(2, '0'),
        secs: String(s).padStart(2, '0'),
        isExpired: diff <= 0
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetIsoDate]);

  return timeLeft;
}

// 2. REUSABLE GUEST PERSONALIZATION LOGIC (?to= parameter & ?notamu=1 universal mode)
export function useGuestRecipient(defaultName = 'Bpk. Hendra Wijaya & Keluarga') {
  const [hideGuestName] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('notamu') === '1' || params.get('tanpa_nama') === '1';
    }
    return false;
  });

  const [guestName, setGuestName] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('notamu') === '1' || params.get('tanpa_nama') === '1') {
        return '';
      }
      const urlTo = params.get('to');
      if (urlTo && urlTo.trim()) return decodeURIComponent(urlTo.trim());
      if (params.get('client')) return 'Bapak / Ibu / Saudara / i';
    }
    return defaultName;
  });

  const [isEditingGuest, setIsEditingGuest] = useState(false);

  return {
    guestName,
    setGuestName,
    isEditingGuest,
    setIsEditingGuest,
    hideGuestName
  };
}

// 3. REUSABLE AUDIO CONTROLLER — plays real audio from audioUrl (Cloudinary / catalog)
export function useAudioController(
  defaultSongTitle = 'Until I Found You - Stephen Sanchez',
  audioUrl?: string
) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showAudioToast, setShowAudioToast] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playableUrl = sanitizeAudioUrl(audioUrl);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current = null;
    setIsPlayingAudio(false);
  }, [playableUrl]);

  const ensureAudio = (): HTMLAudioElement | null => {
    if (!playableUrl || typeof window === 'undefined') return null;

    if (!audioRef.current) {
      const audio = new Audio(playableUrl);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0.4;
      audio.addEventListener('ended', () => setIsPlayingAudio(false));
      audio.addEventListener('error', () => setIsPlayingAudio(false));
      audioRef.current = audio;
    }

    return audioRef.current;
  };

  const showToast = (ms = 3000) => {
    setShowAudioToast(true);
    setTimeout(() => setShowAudioToast(false), ms);
  };

  const toggleAudio = () => {
    const audio = ensureAudio();
    if (!audio) {
      showToast();
      return;
    }

    if (!audio.paused) {
      audio.pause();
      setIsPlayingAudio(false);
      showToast();
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlayingAudio(true);
        showToast();
      })
      .catch(() => setIsPlayingAudio(false));
  };

  const startAudio = () => {
    const audio = ensureAudio();
    if (!audio) return;

    audio
      .play()
      .then(() => {
        setIsPlayingAudio(true);
        showToast(4000);
      })
      .catch(() => setIsPlayingAudio(false));
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setIsPlayingAudio(false);
  };

  return {
    isPlayingAudio,
    showAudioToast,
    toggleAudio,
    startAudio,
    stopAudio,
    songTitle: defaultSongTitle,
    hasAudio: Boolean(playableUrl)
  };
}

// 4. REUSABLE CLIPBOARD COPIER
export function useClipboardCopy(resetDelayMs = 2500) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key = 'default') => {
    safeCopyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), resetDelayMs);
  };

  const isCopied = (key = 'default') => copiedKey === key;

  return { copyText, isCopied, copiedKey };
}

// 5. REUSABLE GUESTBOOK LOGIC
export interface WishItem {
  name: string;
  message: string;
  time?: string;
  rotate?: number;
}

export function useGuestbook(initialWishes: WishItem[] = []) {
  const [wishes, setWishes] = useState<WishItem[]>(initialWishes);
  const [nameInput, setNameInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const submitWish = async (e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();
    if (!nameInput.trim() || !messageInput.trim()) return false;

    try {
      await requestRateLimitPermit('guestbook');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Ucapan belum dapat dikirim.');
      return false;
    }

    const newWish: WishItem = {
      name: nameInput.trim(),
      message: messageInput.trim(),
      time: 'Baru saja'
    };

    setWishes(prev => [newWish, ...prev]);
    setNameInput('');
    setMessageInput('');
    return true;
  };

  return {
    wishes,
    nameInput,
    setNameInput,
    messageInput,
    setMessageInput,
    submitWish
  };
}

// 6. REUSABLE RSVP FORM LOGIC
export function useRsvpForm(onSuccessCallback?: () => void) {
  const [rsvpName, setRsvpName] = useState('');
  const [attendance, setAttendance] = useState<'hadir' | 'tidak_hadir' | 'ragu'>('hadir');
  const [guestCount, setGuestCount] = useState('2');
  const [isSuccess, setIsSuccess] = useState(false);

  const submitRsvp = async (e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();
    if (!rsvpName.trim()) return false;

    try {
      await requestRateLimitPermit('rsvp');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Reservasi belum dapat dikirim.');
      return false;
    }

    setIsSuccess(true);
    if (onSuccessCallback) onSuccessCallback();
    setTimeout(() => setIsSuccess(false), 5000);
    return true;
  };

  return {
    rsvpName,
    setRsvpName,
    attendance,
    setAttendance,
    guestCount,
    setGuestCount,
    isSuccess,
    submitRsvp
  };
}

// 7. REUSABLE LIGHTBOX LOGIC
export function useLightbox() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const openPhoto = (src: string) => setSelectedPhoto(src);
  const closePhoto = () => setSelectedPhoto(null);

  return {
    selectedPhoto,
    openPhoto,
    closePhoto,
    isOpen: selectedPhoto !== null
  };
}

// 8. GOOGLE CALENDAR URL GENERATOR
export function generateGoogleCalendarUrl(params: {
  title: string;
  startDateIso: string; // "20270214T010000Z"
  endDateIso: string; // "20270214T070000Z"
  details: string;
  location: string;
}) {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const query = new URLSearchParams({
    text: params.title,
    dates: `${params.startDateIso}/${params.endDateIso}`,
    details: params.details,
    location: params.location
  });
  return `${base}&${query.toString()}`;
}
