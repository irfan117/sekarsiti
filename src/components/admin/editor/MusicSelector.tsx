import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Upload,
  Play,
  Pause,
  Plus,
  Check,
  Loader2,
  Link2,
  Trash2,
  ShieldCheck,
  Sparkles,
  Lock,
  Info
} from 'lucide-react';
import {
  MusicTrack,
  fetchMusicTracks,
  uploadMusicToCloudinary,
  addMusicTrack,
  deleteMusicTrack,
  isPlayableAudioUrl,
  sanitizeAudioUrl,
} from '../../../services/musicService';
import { isCloudinaryConfigured } from '../../../utils/cloudinaryUpload';
import { ClientCustomMusicTrack } from '../../../types/clientInvitation';

export interface MusicSelectorProps {
  currentSongTitle: string;
  currentAudioUrl?: string;
  onSelect: (songTitle: string, audioUrl: string) => void;
  /** 'admin' gives full control to master catalog. 'client' protects master catalog (no delete/add) and provides 1 isolated custom track slot. Default: 'admin'. */
  mode?: 'admin' | 'client';
  /** For client mode: current client's 1 custom track (isolated, private) */
  clientCustomTrack?: ClientCustomMusicTrack | null;
  /** For client mode: callback when client adds or removes their 1 custom track */
  onClientCustomTrackChange?: (customTrack: ClientCustomMusicTrack | null) => void;
  /** Deprecated flag, kept for backward compatibility */
  addUploadsToCatalog?: boolean;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({
  currentSongTitle,
  currentAudioUrl,
  onSelect,
  mode = 'admin',
  clientCustomTrack = null,
  onClientCustomTrackChange,
  addUploadsToCatalog = true,
}) => {
  const isClientMode = mode === 'client';

  const [adminTracks, setAdminTracks] = useState<MusicTrack[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingTrackId, setIsDeletingTrackId] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newDirectUrl, setNewDirectUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load official admin master tracks
  useEffect(() => {
    setIsLoadingTracks(true);
    fetchMusicTracks()
      .then((data) => {
        setAdminTracks((data || []).filter((track) => isPlayableAudioUrl(track.audio_url)));
      })
      .catch((err) => {
        console.warn('Gagal memuat katalog musik:', err);
        setAdminTracks([]);
      })
      .finally(() => {
        setIsLoadingTracks(false);
      });
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlayPreview = (track: { id: string; audio_url: string }) => {
    if (!isPlayableAudioUrl(track.audio_url)) {
      setUploadError('URL audio tidak valid untuk diputar.');
      return;
    }

    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = track.audio_url;
    audioRef.current
      .play()
      .then(() => setPlayingTrackId(track.id))
      .catch((e) => {
        console.warn('Preview play blocked', e);
        setUploadError('Browser memblokir pratinjau audio otomatis. Klik tombol putar sekali lagi.');
      });
    audioRef.current.onended = () => setPlayingTrackId(null);
  };

  // Upload handler: distinguishes between client custom track (isolated, max 1) vs admin master catalog
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCloudinaryConfigured) {
      setUploadError(
        'Layanan penyimpanan audio belum siap. Hubungi admin atau gunakan link audio langsung.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const audioUrl = await uploadMusicToCloudinary(file);
      const title = newTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
      const artist = newArtist.trim() || (isClientMode ? 'Lagu Pilihan Mempelai' : 'Sekarsiti Audio');

      if (isClientMode) {
        // CLIENT MODE: Simpan sebagai 1 lagu kustom privat mempelai (TIDAK MASUK KE KATALOG MASTER ADMIN)
        const customTrack: ClientCustomMusicTrack = {
          id: `custom-track-${Date.now()}`,
          title,
          artist,
          audioUrl,
          createdAt: new Date().toISOString(),
        };

        onClientCustomTrackChange?.(customTrack);
        onSelect(`${title} - ${artist}`, audioUrl);
        setShowUploadForm(false);
      } else {
        // ADMIN MODE: Menambah ke katalog master admin jika addUploadsToCatalog true
        if (addUploadsToCatalog) {
          const newTrack = await addMusicTrack({
            title,
            artist,
            audio_url: audioUrl,
            genre: 'Koleksi Admin',
            source: 'admin',
          });
          setAdminTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)]);
          onSelect(`${newTrack.title} - ${newTrack.artist}`, newTrack.audio_url);
        } else {
          onSelect(`${title} - ${artist}`, audioUrl);
        }
        setShowUploadForm(false);
      }

      setNewTitle('');
      setNewArtist('');
      setNewDirectUrl('');
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Gagal mengunggah musik.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Direct URL handler: distinguishes between client custom track vs admin catalog
  const handleDirectUrlAdd = async () => {
    const normalizedUrl = sanitizeAudioUrl(newDirectUrl);
    if (!normalizedUrl) {
      setUploadError('Masukkan URL audio langsung (.mp3/.m4a/.wav), URL Cloudinary, atau link Google Drive yang valid.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const title = newTitle.trim() || 'Lagu Custom';
      const artist = newArtist.trim() || (isClientMode ? 'Pilihan Mempelai' : 'Custom Link');

      if (isClientMode) {
        // CLIENT MODE: Simpan sebagai 1 lagu kustom privat mempelai (TIDAK MASUK KE KATALOG MASTER ADMIN)
        const customTrack: ClientCustomMusicTrack = {
          id: `custom-track-${Date.now()}`,
          title,
          artist,
          audioUrl: normalizedUrl,
          createdAt: new Date().toISOString(),
        };

        onClientCustomTrackChange?.(customTrack);
        onSelect(`${title} - ${artist}`, normalizedUrl);
        setShowUploadForm(false);
      } else {
        // ADMIN MODE: Menambah ke katalog master admin
        if (addUploadsToCatalog) {
          const newTrack = await addMusicTrack({
            title,
            artist,
            audio_url: normalizedUrl,
            genre: 'Koleksi Admin',
            source: 'admin',
          });
          setAdminTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)]);
          onSelect(`${newTrack.title} - ${newTrack.artist}`, newTrack.audio_url);
        } else {
          onSelect(`${title} - ${artist}`, normalizedUrl);
        }
        setShowUploadForm(false);
      }

      setNewTitle('');
      setNewArtist('');
      setNewDirectUrl('');
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Gagal menyimpan link musik.');
    } finally {
      setIsUploading(false);
    }
  };

  // Client deletes their 1 custom track
  const handleDeleteClientCustomTrack = () => {
    if (!clientCustomTrack) return;

    const confirmed = window.confirm(
      `Hapus lagu kustom "${clientCustomTrack.title}" dari undangan Anda?\n\nSetelah dihapus, Anda dapat mengunggah 1 lagu kustom baru atau memilih lagu dari katalog Sekarsiti.`
    );
    if (!confirmed) return;

    if (playingTrackId === (clientCustomTrack.id || 'custom-track')) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    }

    onClientCustomTrackChange?.(null);

    // If current selected audio was this custom track, reset selection
    if (currentAudioUrl === clientCustomTrack.audioUrl) {
      onSelect('', '');
    }
  };

  // Admin deletes a track from the master catalog
  const handleDeleteAdminTrack = async (track: MusicTrack) => {
    if (!track.id || isClientMode) return;

    const confirmed = window.confirm(`Hapus musik "${track.title}" secara permanen dari katalog master Sekarsiti?`);
    if (!confirmed) return;

    setIsDeletingTrackId(track.id);

    try {
      await deleteMusicTrack(track.id);
      setAdminTracks((prev) => prev.filter((item) => item.id !== track.id));

      if (currentAudioUrl === track.audio_url) {
        onSelect('', '');
      }
    } catch (err: any) {
      console.error('Gagal menghapus musik:', err);
      setUploadError(err?.message || 'Gagal menghapus musik dari katalog admin.');
    } finally {
      setIsDeletingTrackId(null);
    }
  };

  const hasClientCustomTrack = Boolean(clientCustomTrack?.audioUrl);

  return (
    <div className="space-y-4 p-4 sm:p-5 bg-[#FAF7F2] border border-[#E5E0D8] rounded-2xl text-left">
      
      {/* HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-3">
        <div>
          <label className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
            <Music className="w-4 h-4 text-[#C5A880]" />
            <span>Pilih Musik Pengiring Undangan</span>
          </label>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {isClientMode
              ? 'Pilih musik instrumen resmi Sekarsiti atau unggah 1 lagu kustom romantis pilihan Anda.'
              : 'Kelola pustaka musik resmi admin dan pasang pada undangan.'}
          </p>
        </div>

        {/* Action Button: Untuk Admin (Upload ke Katalog) atau Untuk Client (Jika belum punya lagu kustom) */}
        {!isClientMode ? (
          <button
            type="button"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="text-[11px] font-semibold text-[#8C6D3F] hover:text-[#6F5229] bg-[#F4EDE2] hover:bg-[#EAE0D1] border border-[#DCD3C5] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showUploadForm ? 'Tutup Form' : '+ Upload ke Katalog Admin'}</span>
          </button>
        ) : !hasClientCustomTrack ? (
          <button
            type="button"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="text-[11px] font-semibold text-[#8C6D3F] hover:text-[#6F5229] bg-[#F4EDE2] hover:bg-[#EAE0D1] border border-[#DCD3C5] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{showUploadForm ? 'Tutup Upload' : '+ Unggah Lagu Kustom (Maks. 1)'}</span>
          </button>
        ) : null}
      </div>

      {/* STATUS MUSIK TERPILIH SAAT INI */}
      <div className="p-3 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
            MUSIK TERPASANG PADA UNDANGAN:
          </span>
          <p className="font-bold text-stone-900 truncate mt-0.5 text-xs sm:text-sm">
            {currentSongTitle || 'Belum ada musik yang dipilih'}
          </p>
          {currentAudioUrl && isPlayableAudioUrl(currentAudioUrl) && (
            <audio controls src={currentAudioUrl} className="w-full h-8 mt-2 max-w-md" />
          )}
        </div>
        {currentAudioUrl && isPlayableAudioUrl(currentAudioUrl) && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Aktif Memutar</span>
          </span>
        )}
      </div>

      {/* FORM UPLOAD (Admin atau Client) */}
      {showUploadForm && (
        <div className="p-4 bg-white border-2 border-[#C5A880]/50 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#C5A880]" />
              <span className="text-xs font-bold text-stone-900">
                {isClientMode ? 'Unggah 1 Lagu Kustom Mempelai' : 'Tambah Lagu ke Katalog Master Admin'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#C5A880] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5E0D8]">
              {isClientMode ? 'Privat (Khusus Undangan Anda)' : 'Katalog Master'}
            </span>
          </div>

          {isClientMode && (
            <div className="p-2.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded-lg text-[11px] text-stone-600 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
              <p>
                <strong>Ketentuan Lagu Kustom:</strong> Maksimal 1 lagu kustom. Lagu ini hanya tersimpan
                pada undangan Anda dan tidak dapat dilihat maupun digunakan oleh pasangan lain.
              </p>
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium">
              {uploadError}
            </p>
          )}

          {/* Toggle Tab: File Audio vs Direct Link */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                uploadMode === 'file'
                  ? 'bg-[#181816] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Upload File (MP3 / WAV / M4A)
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                uploadMode === 'link'
                  ? 'bg-[#181816] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tempel Link Audio (URL)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                Judul Lagu *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Until I Found You"
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#C5A880] bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                Penyanyi / Artis
              </label>
              <input
                type="text"
                value={newArtist}
                onChange={(e) => setNewArtist(e.target.value)}
                placeholder="Contoh: Stephen Sanchez"
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#C5A880] bg-white"
              />
            </div>
          </div>

          {uploadMode === 'file' ? (
            <div className="pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto py-2 px-4 bg-[#181816] hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                    <span>Sedang Mengunggah Audio...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-[#C5A880]" />
                    <span>Pilih Berkas Audio dari Perangkat</span>
                  </>
                )}
              </button>
              <span className="block text-[10px] text-stone-400 mt-1">
                Format didukung: MP3, M4A, WAV, WebM (Maks. 15MB disarankan).
              </span>
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <label className="block text-[10px] font-bold text-stone-600 uppercase">
                URL Audio Langsung / Link Cloudinary:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={newDirectUrl}
                  onChange={(e) => setNewDirectUrl(e.target.value)}
                  placeholder="https://...file.mp3 atau link Google Drive"
                  className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#C5A880] bg-white"
                />
                <button
                  type="button"
                  disabled={isUploading || !newDirectUrl.trim()}
                  onClick={handleDirectUrlAdd}
                  className="py-1.5 px-4 bg-[#181816] hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Simpan Lagu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          BAGIAN 1: LAGU KUSTOM MEMPELAI (KHUSUS MODE CLIENT)
          KETENTUAN: MAKSIMAL 1 LAGU, BISA DITAMBAH & DIHAPUS,
          TIDAK DAPAT DILIHAT OLEH KLIEN LAIN.
          ======================================================== */}
      {isClientMode && (
        <div className="p-3.5 sm:p-4 bg-white border border-[#DCD3C5] rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <span className="text-xs font-bold text-stone-900">
                Lagu Kustom Mempelai
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                hasClientCustomTrack
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {hasClientCustomTrack ? '1 / 1 Lagu Terisi' : '0 / 1 Lagu (Tersedia Kuota)'}
            </span>
          </div>

          <p className="text-[11px] text-stone-500">
            Lagu khusus Anda sendiri. Bersifat privat dan hanya muncul pada portal Anda (tidak terlihat oleh klien lain).
          </p>

          {hasClientCustomTrack && clientCustomTrack ? (
            <div className="p-3 bg-[#FAF7F2] border border-[#C5A880]/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    togglePlayPreview({
                      id: clientCustomTrack.id || 'custom-track',
                      audio_url: clientCustomTrack.audioUrl,
                    })
                  }
                  className="p-2 rounded-full bg-white hover:bg-stone-100 text-stone-800 cursor-pointer shrink-0 border border-stone-200 shadow-2xs"
                  title="Dengarkan lagu kustom"
                >
                  {playingTrackId === (clientCustomTrack.id || 'custom-track') ? (
                    <Pause className="w-4 h-4 text-[#C5A880]" />
                  ) : (
                    <Play className="w-4 h-4 text-stone-700" />
                  )}
                </button>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-stone-900">
                      {clientCustomTrack.title}
                    </p>
                    <span className="text-[9px] font-bold text-[#8C6D3F] bg-[#F2ECE1] px-1.5 py-0.5 rounded border border-[#E0D5C3]">
                      Lagu Kustom Anda
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 truncate mt-0.5">
                    {clientCustomTrack.artist || 'Pilihan Mempelai'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleDeleteClientCustomTrack}
                  className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer flex items-center gap-1 transition-colors"
                  title="Hapus lagu kustom ini dari undangan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Lagu Kustom</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSelect(
                      `${clientCustomTrack.title} - ${clientCustomTrack.artist || 'Pilihan Mempelai'}`,
                      clientCustomTrack.audioUrl
                    )
                  }
                  className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    currentAudioUrl === clientCustomTrack.audioUrl
                      ? 'bg-[#C5A880] text-[#181816]'
                      : 'bg-[#181816] hover:bg-stone-800 text-white'
                  }`}
                >
                  {currentAudioUrl === clientCustomTrack.audioUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Terpasang</span>
                    </>
                  ) : (
                    <span>Pasang di Undangan</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="text-stone-500 text-[11px]">
                Belum ada lagu kustom. Anda memiliki kuota 1 lagu romantis untuk diunggah.
              </span>
              <button
                type="button"
                onClick={() => setShowUploadForm(true)}
                className="py-1 px-3 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5CDBC] text-[#8C6D3F] rounded-lg text-[11px] font-semibold cursor-pointer shrink-0 transition-colors"
              >
                + Unggah 1 Lagu Kustom
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          BAGIAN 2: KATALOG RESMI ADMIN SEKARSITI
          KETENTUAN:
          - KLIEN TIDAK BISA MENGHAPUS (HAPUS HANYA UNTUK ADMIN)
          - KLIEN TIDAK BISA MENAMBAH KE KATALOG MASTER
          - AMAN & BEBAS HAK CIPTA
          ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                Katalog Musik Pilihan Sekarsiti
              </span>
              <span className="text-[10px] text-stone-500 block">
                {isClientMode
                  ? 'Katalog resmi pilihan admin. Daftar ini bersifat tetap dan tidak dapat dihapus.'
                  : 'Katalog musik resmi yang tampil untuk semua klien.'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
            {adminTracks.length} Pilihan Lagu
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {isLoadingTracks ? (
            <div className="p-4 bg-white border border-stone-200 rounded-xl text-center text-xs text-stone-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
              <span>Memuat katalog musik resmi...</span>
            </div>
          ) : adminTracks.length === 0 ? (
            <div className="p-4 bg-white border border-dashed border-stone-300 rounded-xl text-xs text-stone-500 text-center">
              Belum ada lagu di katalog resmi. Hubungi admin untuk menambahkan lagu pilihan.
            </div>
          ) : (
            adminTracks.map((track) => {
              const isSelected =
                currentAudioUrl === track.audio_url ||
                (Boolean(currentSongTitle) &&
                  Boolean(track.title) &&
                  currentSongTitle.toLowerCase().includes(track.title.toLowerCase()));

              return (
                <div
                  key={track.id}
                  className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors border ${
                    isSelected
                      ? 'bg-[#F4ECE1] border-[#C5A880] text-stone-900 font-medium shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => togglePlayPreview(track)}
                      className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer shrink-0 transition-colors"
                      title="Dengarkan lagu"
                    >
                      {playingTrackId === track.id ? (
                        <Pause className="w-3.5 h-3.5 text-[#C5A880]" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-stone-700" />
                      )}
                    </button>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-bold text-stone-900">
                          {track.title}
                        </p>
                        <span className="text-[9px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                          Resmi
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {track.artist} {track.genre ? `• ${track.genre}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* HANYA ADMIN YANG DAPAT MENGHAPUS DARI KATALOG MASTER */}
                    {!isClientMode && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAdminTrack(track)}
                        disabled={isDeletingTrackId === track.id}
                        className="py-1 px-2 rounded-lg text-[10px] font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                        title="Hapus lagu dari katalog master"
                      >
                        {isDeletingTrackId === track.id ? '...' : 'Hapus'}
                      </button>
                    )}

                    {/* Tombol Pasang / Terpasang (Tersedia untuk Admin & Client) */}
                    <button
                      type="button"
                      onClick={() => onSelect(`${track.title} - ${track.artist}`, track.audio_url)}
                      className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#C5A880] text-[#181816]'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 text-[#181816]" />
                          <span>Terpasang</span>
                        </>
                      ) : (
                        <span>Pasang</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
