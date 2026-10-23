import React, { useState, useEffect, useRef } from 'react';
import { Music, Upload, Play, Pause, Plus, Check, Loader2, Link2 } from 'lucide-react';
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

interface MusicSelectorProps {
  currentSongTitle: string;
  currentAudioUrl?: string;
  onSelect: (songTitle: string, audioUrl: string) => void;
  /** When false, uploaded tracks are only applied to the invitation (not added to catalog). Default true. */
  addUploadsToCatalog?: boolean;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({
  currentSongTitle,
  currentAudioUrl,
  onSelect,
  addUploadsToCatalog = true,
}) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingTrackId, setIsDeletingTrackId] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newDirectUrl, setNewDirectUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchMusicTracks()
      .then((data) => {
        setTracks((data || []).filter((track) => isPlayableAudioUrl(track.audio_url)));
      })
      .catch(() => setTracks([]));
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlayPreview = (track: MusicTrack) => {
    if (!isPlayableAudioUrl(track.audio_url)) {
      setUploadError('URL audio tidak valid. Hapus track ini dan upload ulang.');
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
        setUploadError('Browser memblokir pratinjau audio. Coba klik lagi atau pilih file lain.');
      });
    audioRef.current.onended = () => setPlayingTrackId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCloudinaryConfigured) {
      setUploadError(
        'Cloudinary belum dikonfigurasi. Isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET di .env'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const audioUrl = await uploadMusicToCloudinary(file);
      const title = newTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
      const artist = newArtist.trim() || 'Custom Upload';

      if (addUploadsToCatalog) {
        const newTrack = await addMusicTrack({
          title,
          artist,
          audio_url: audioUrl,
          genre: 'Custom Wedding',
          source: 'admin',
        });

        setTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)]);
        onSelect(`${newTrack.title} - ${newTrack.artist}`, newTrack.audio_url);
      } else {
        onSelect(`${title} - ${artist}`, audioUrl);
      }

      setShowUploadForm(false);
      setNewTitle('');
      setNewArtist('');
      setNewDirectUrl('');
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Gagal mengunggah musik');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDirectUrlAdd = async () => {
    const normalizedUrl = sanitizeAudioUrl(newDirectUrl);
    if (!normalizedUrl) {
      setUploadError('Masukkan URL audio langsung (.mp3/.m4a/.wav), URL Cloudinary, atau link Google Drive yang valid.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const title = newTitle.trim() || 'Custom Audio Link';
      const artist = newArtist.trim() || 'Custom Link';

      if (addUploadsToCatalog) {
        const newTrack = await addMusicTrack({
          title,
          artist,
          audio_url: normalizedUrl,
          genre: 'Custom Wedding',
          source: 'admin',
        });

        setTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)]);
        onSelect(`${newTrack.title} - ${newTrack.artist}`, newTrack.audio_url);
      } else {
        onSelect(`${title} - ${artist}`, normalizedUrl);
      }

      setShowUploadForm(false);
      setNewTitle('');
      setNewArtist('');
      setNewDirectUrl('');
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Gagal menyimpan link musik');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteTrack = async (track: MusicTrack) => {
    if (!track.id) return;

    const shouldDelete = window.confirm(`Hapus musik "${track.title}" dari daftar katalog?`);
    if (!shouldDelete) return;

    setIsDeletingTrackId(track.id);

    try {
      await deleteMusicTrack(track.id);
      setTracks((prev) => prev.filter((item) => item.id !== track.id));

      if (currentAudioUrl === track.audio_url) {
        onSelect('', '');
      }
    } catch (err: any) {
      console.error('Gagal menghapus musik:', err);
      setUploadError(err?.message || 'Gagal menghapus musik dari katalog.');
    } finally {
      setIsDeletingTrackId(null);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Pilih Musik Pengiring Undangan</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="text-[11px] font-semibold text-[#C5A880] hover:text-[#9B7F54] flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showUploadForm ? 'Tutup Upload' : '+ Upload Lagu Baru'}</span>
        </button>
      </div>

      <div className="p-2.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between text-xs">
        <div className="truncate">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-medium">
            Musik Terpilih Saat Ini:
          </span>
          <span className="font-semibold text-stone-800 truncate">
            {currentSongTitle || 'Belum ada lagu yang dipilih'}
          </span>
          {currentAudioUrl && isPlayableAudioUrl(currentAudioUrl) && (
            <audio controls src={currentAudioUrl} className="w-full h-8 mt-2" />
          )}
        </div>
      </div>

      {showUploadForm && (
        <div className="p-3 bg-white border border-[#D5D0C6] rounded-xl space-y-3">
          <span className="text-[11px] font-bold text-stone-800 block">
            Upload File Musik (MP3 / WAV / M4A / WebM) ke Cloudinary
          </span>

          {uploadError && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{uploadError}</p>
          )}

          {!isCloudinaryConfigured && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
              Cloudinary belum siap. Lengkapi variabel lingkungan sebelum mengunggah.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Judul Lagu (contoh: Until I Found You)"
              className="px-2.5 py-1.5 border border-stone-300 rounded text-xs focus:outline-none"
            />
            <input
              type="text"
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              placeholder="Penyanyi / Artis (contoh: Stephen Sanchez)"
              className="px-2.5 py-1.5 border border-stone-300 rounded text-xs focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
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
              className="py-1.5 px-3 bg-[#181816] hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Pilih File Audio &amp; Upload</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-stone-200 space-y-1.5">
            <span className="text-[10px] font-semibold text-stone-600 block">
              Atau Tempel Link Audio Eksternal (Cloudinary / Google Drive / Direct MP3):
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={newDirectUrl}
                onChange={(e) => setNewDirectUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... atau link Google Drive"
                className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded text-xs focus:outline-none"
              />
              <button
                type="button"
                disabled={isUploading || !newDirectUrl.trim()}
                onClick={handleDirectUrlAdd}
                className="py-1.5 px-3 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Link2 className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Simpan Link Lagu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {tracks.length === 0 ? (
          <div className="p-3 bg-white border border-dashed border-stone-300 rounded-lg text-xs text-stone-500">
            Katalog musik masih kosong. Upload lagu baru agar bisa dipilih sebagai musik latar undangan.
          </div>
        ) : (
          tracks.map((track) => {
            const isSelected =
              currentAudioUrl === track.audio_url ||
              (Boolean(currentSongTitle) &&
                currentSongTitle.toLowerCase().includes(track.title.toLowerCase()));

            return (
              <div
                key={track.id}
                className={`p-2 rounded-lg flex items-center justify-between text-xs transition-colors border ${
                  isSelected
                    ? 'bg-[#F2ECE1] border-[#C5A880] text-stone-900 font-medium'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => togglePlayPreview(track)}
                    className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer shrink-0"
                    title="Dengarkan pratinjau lagu"
                  >
                    {playingTrackId === track.id ? (
                      <Pause className="w-3.5 h-3.5 text-[#C5A880]" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-stone-700" />
                    )}
                  </button>
                  <div className="truncate">
                    <p className="truncate text-xs font-semibold text-stone-900">{track.title}</p>
                    <p className="text-[10px] text-stone-500 truncate">
                      {track.artist} {track.genre ? `• ${track.genre}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeleteTrack(track)}
                    disabled={isDeletingTrackId === track.id}
                    className="py-1 px-2 rounded text-[10px] font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                  >
                    {isDeletingTrackId === track.id ? 'Menghapus...' : 'Hapus'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelect(`${track.title} - ${track.artist}`, track.audio_url)}
                    className={`py-1 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#C5A880] text-[#181816]'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3 h-3" />
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
  );
};
