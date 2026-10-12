/**
 * Layanan untuk mengelola Pustaka Musik di Supabase & Upload Cloudinary/Storage
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { uploadAudioToCloudinary, isCloudinaryConfigured } from '../utils/cloudinaryUpload';
import { readPersistedJson, writePersistedJson } from '../utils/persistedStore';
import { isPlayableAudioUrl } from '../utils/audioUrl';

export { isBrokenAudioUrl, isPlayableAudioUrl, sanitizeAudioUrl } from '../utils/audioUrl';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  duration_seconds?: number;
  genre?: string;
  source?: 'admin' | 'custom';
  created_at?: string;
}

const MUSIC_STORAGE_KEY = 'sekarsiti_music_tracks_v1';


/** Katalog awal kosong: admin mengisi lewat upload. Track lokal lama tetap dimuat. */
export const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [];

function readLocalTracks(): MusicTrack[] {
  return readPersistedJson<MusicTrack[]>(MUSIC_STORAGE_KEY, []).filter(
    (track) => track?.id && isPlayableAudioUrl(track.audio_url)
  );
}

function writeLocalTracks(tracks: MusicTrack[]): void {
  writePersistedJson(
    MUSIC_STORAGE_KEY,
    tracks.filter((track) => track?.id && isPlayableAudioUrl(track.audio_url))
  );
}

function mergeTracks(...lists: MusicTrack[][]): MusicTrack[] {
  const byId = new Map<string, MusicTrack>();
  const byUrl = new Map<string, MusicTrack>();

  for (const list of lists) {
    for (const track of list) {
      if (!track?.id || !isPlayableAudioUrl(track.audio_url)) continue;
      byId.set(track.id, track);
      byUrl.set(track.audio_url, track);
    }
  }

  // Prefer id map order (newest first from callers)
  const merged: MusicTrack[] = [];
  const seenUrls = new Set<string>();
  for (const track of byId.values()) {
    if (seenUrls.has(track.audio_url)) continue;
    seenUrls.add(track.audio_url);
    merged.push(track);
  }

  // Include any url-only leftovers (shouldn't happen often)
  for (const track of byUrl.values()) {
    if (seenUrls.has(track.audio_url)) continue;
    seenUrls.add(track.audio_url);
    merged.push(track);
  }

  return merged;
}

export async function fetchMusicTracks(): Promise<MusicTrack[]> {
  const localTracks = readLocalTracks();

  if (!isSupabaseConfigured) {
    return localTracks.length > 0 ? localTracks : DEFAULT_MUSIC_TRACKS;
  }

  try {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Gagal mengambil music_tracks dari Supabase:', error.message);
      return localTracks;
    }

    const remotePlayable = (data || []).filter((track: MusicTrack) =>
      isPlayableAudioUrl(track.audio_url)
    );

    const merged = mergeTracks(localTracks, remotePlayable);
    writeLocalTracks(merged);
    return merged;
  } catch (err) {
    console.error('Error fetching music tracks:', err);
    return localTracks;
  }
}

export async function uploadMusicToCloudinary(file: File): Promise<string> {
  if (!file) {
    throw new Error('File audio tidak ditemukan.');
  }

  const looksLikeAudio =
    file.type.startsWith('audio/') ||
    /\.(mp3|wav|m4a|aac|ogg|oga|webm|flac|mpeg)$/i.test(file.name);

  if (!looksLikeAudio) {
    throw new Error('Format file harus berupa audio (.mp3, .wav, .m4a, .ogg, .webm).');
  }

  if (!isCloudinaryConfigured) {
    throw new Error(
      'Cloudinary belum dikonfigurasi. Isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET di file .env'
    );
  }

  // Upload file asli — konversi WebM di browser sering gagal/lambat untuk MP3 panjang.
  return uploadAudioToCloudinary(file);
}

export async function addMusicTrack(
  track: Omit<MusicTrack, 'id' | 'created_at'>
): Promise<MusicTrack> {
  if (!isPlayableAudioUrl(track.audio_url)) {
    throw new Error('URL audio tidak valid. Upload ulang file musik.');
  }

  const payload = {
    title: track.title.trim() || 'Lagu Custom',
    artist: track.artist.trim() || 'Custom Upload',
    audio_url: track.audio_url,
    genre: track.genre || 'Romantic',
    source: track.source || 'admin',
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('music_tracks')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert music track gagal, simpan lokal:', error.message);
      } else if (data) {
        const merged = mergeTracks([data as MusicTrack], readLocalTracks());
        writeLocalTracks(merged);
        return data as MusicTrack;
      }
    } catch (err) {
      console.warn('Supabase insert music track error, fallback lokal:', err);
    }
  }

  const localTrack: MusicTrack = {
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...payload,
  };

  writeLocalTracks(mergeTracks([localTrack], readLocalTracks()));
  return localTrack;
}

export async function deleteMusicTrack(id: string): Promise<void> {
  if (!id) return;

  const localRemaining = readLocalTracks().filter((track) => track.id !== id);
  writeLocalTracks(localRemaining);

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid || !isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.from('music_tracks').delete().eq('id', id);
  if (error) {
    throw error;
  }
}
