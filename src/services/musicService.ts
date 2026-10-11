/**
 * Layanan untuk mengelola Pustaka Musik di Supabase & Upload Cloudinary/Storage
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { convertAudioFileToWebm, uploadAudioToCloudinary } from '../utils/cloudinaryUpload';

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

// Koleksi Awal Bawaan (Default Dummy Track saat offline / fresh)
export const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'default-track-1',
    title: 'Until I Found You (Acoustic Guitar)',
    artist: 'Stephen Sanchez Style',
    audio_url: 'https://actions.google.com/sounds/v1/water/gentle_stream_spring.ogg',
    genre: 'Romantic Modern',
  },
  {
    id: 'default-track-2',
    title: 'A Thousand Years (Violin & Piano Solo)',
    artist: 'Chamber Strings',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg',
    genre: 'Acoustic Classical',
  },
  {
    id: 'default-track-3',
    title: 'Canon in D Major (Warm Cello & Piano)',
    artist: 'Johann Pachelbel',
    audio_url: 'https://actions.google.com/sounds/v1/relaxing/relaxing_waves.ogg',
    genre: 'Classical Chamber',
  },
];

export async function fetchMusicTracks(): Promise<MusicTrack[]> {
  if (!isSupabaseConfigured) {
    return DEFAULT_MUSIC_TRACKS;
  }

  try {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_MUSIC_TRACKS;
    }

    return data;
  } catch (err) {
    console.error('Error fetching music tracks:', err);
    return DEFAULT_MUSIC_TRACKS;
  }
}

export async function uploadMusicToCloudinary(file: File): Promise<string> {
  const convertedFile = await convertAudioFileToWebm(file);
  return uploadAudioToCloudinary(convertedFile);
}

export async function addMusicTrack(track: Omit<MusicTrack, 'id' | 'created_at'>): Promise<MusicTrack> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('music_tracks')
      .insert({
        title: track.title,
        artist: track.artist,
        audio_url: track.audio_url,
        genre: track.genre || 'Romantic',
        source: track.source || 'admin',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  return {
    id: `local-${Date.now()}`,
    source: track.source || 'admin',
    ...track,
  };
}

export async function deleteMusicTrack(id: string): Promise<void> {
  if (!id) {
    return;
  }

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('music_tracks')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    return;
  }
}
