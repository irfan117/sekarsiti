-- ==============================================================================
-- SEKARSITI WED - MUSIC LIBRARY MIGRATION
-- Migration: 20261005000001_create_music_library.sql
-- Compatible with: npx supabase db push
-- ==============================================================================

-- Tabel Katalog Musik Latar (Music Tracks Library)
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(150) NOT NULL DEFAULT 'Unknown Artist',
  audio_url TEXT NOT NULL,
  duration_seconds INT DEFAULT 0,
  genre VARCHAR(50) DEFAULT 'Romantic & Acoustic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeks
CREATE INDEX IF NOT EXISTS idx_music_tracks_created ON public.music_tracks(created_at DESC);

-- RLS
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Tamu & Public bisa dengar/ambil list musik
CREATE POLICY "Public read music tracks" 
ON public.music_tracks FOR SELECT 
USING (true);

-- Admin terotentikasi bisa tambah dan hapus track musik
CREATE POLICY "Admins full access to music tracks" 
ON public.music_tracks FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Data Awal Musik Elegan Bawaan Sekarsiti
INSERT INTO public.music_tracks (title, artist, audio_url, genre)
VALUES 
  ('A Thousand Years (Violin & Piano Solo)', 'The Piano Guys Style', 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg', 'Acoustic / Classical'),
  ('Canon in D Major (Warm Cello & Piano)', 'Johann Pachelbel', 'https://actions.google.com/sounds/v1/relaxing/relaxing_waves.ogg', 'Classical Chamber'),
  ('Until I Found You (Acoustic Guitar)', 'Stephen Sanchez Style', 'https://actions.google.com/sounds/v1/water/gentle_stream_spring.ogg', 'Romantic Modern')
ON CONFLICT DO NOTHING;
