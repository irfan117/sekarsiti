import React, { useState, useEffect, useRef } from 'react';
import { Music, Upload, Play, Pause, Plus, Check, Loader2 } from 'lucide-react';
import {
  MusicTrack,
  fetchMusicTracks,
  uploadMusicToCloudinary,
  addMusicTrack,
  DEFAULT_MUSIC_TRACKS
} from '../../../services/musicService';

interface MusicSelectorProps {
  currentSongTitle: string;
  currentAudioUrl?: string;
  onSelect: (songTitle: string, audioUrl: string) => void;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({
  currentSongTitle,
  currentAudioUrl,
  onSelect
}) => {
  const [tracks, setTracks] = useState<MusicTrack[]>(DEFAULT_MUSIC_TRACKS);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchMusicTracks().then(data => {
      if (data && data.length > 0) setTracks(data);
    });
  }, []);

  const togglePlayPreview = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(e => console.warn('Preview play blocked', e));
      setPlayingTrackId(track.id);
      audioRef.current.onended = () => setPlayingTrackId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const audioUrl = await uploadMusicToCloudinary(file);
      const title = newTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
      const artist = newArtist.trim() || 'Custom Upload';

      const newTrack = await addMusicTrack({
        title,
        artist,
        audio_url: audioUrl,
        genre: 'Custom Wedding'
      });

      setTracks(prev => [newTrack, ...prev]);
      onSelect(`${newTrack.title} - ${newTrack.artist}`, newTrack.audio_url);
      setShowUploadForm(false);
      setNewTitle('');
      setNewArtist('');
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || 'Gagal mengunggah musik');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

      {/* Selected Indicator */}
      <div className="p-2.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between text-xs">
        <div className="truncate">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-medium">
            Musik Terpilih Saat Ini:
          </span>
          <span className="font-semibold text-stone-800 truncate">
            {currentSongTitle || 'Belum ada lagu yang dipilih'}
          </span>
        </div>
      </div>

      {/* Form Upload Musik Baru */}
      {showUploadForm && (
        <div className="p-3 bg-white border border-[#D5D0C6] rounded-xl space-y-3">
          <span className="text-[11px] font-bold text-stone-800 block">
            Upload File Musik (MP3 / Audio) ke Cloudinary
          </span>

          {uploadError && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{uploadError}</p>
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

          <div className="flex items-center gap-2 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
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
                  <span>Mengunggah ke Cloudinary...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Pilih File Audio &amp; Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Track List Library */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {tracks.map((track) => {
          const isSelected =
            currentSongTitle.toLowerCase().includes(track.title.toLowerCase()) ||
            currentAudioUrl === track.audio_url;

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
                  <p className="truncate text-xs font-semibold text-stone-900">
                    {track.title}
                  </p>
                  <p className="text-[10px] text-stone-500 truncate">
                    {track.artist} {track.genre ? `• ${track.genre}` : ''}
                  </p>
                </div>
              </div>

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
          );
        })}
      </div>
    </div>
  );
};
