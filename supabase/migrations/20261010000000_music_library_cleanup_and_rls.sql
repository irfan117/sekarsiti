-- ==============================================================================
-- SEKARSITI WED - MUSIC LIBRARY HARDENING
-- Migration: 20261010000000_music_library_cleanup_and_rls.sql
-- Compatible with: npx supabase db push
-- ==============================================================================

ALTER TABLE public.music_tracks
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_music_tracks_source ON public.music_tracks(source);

UPDATE public.music_tracks
SET source = 'admin'
WHERE source IS NULL OR source = '';

DROP POLICY IF EXISTS "Public read music tracks" ON public.music_tracks;
DROP POLICY IF EXISTS "Admins full access to music tracks" ON public.music_tracks;

CREATE POLICY "Public can view music library"
ON public.music_tracks FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert music library"
ON public.music_tracks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update music library"
ON public.music_tracks FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete music library"
ON public.music_tracks FOR DELETE
TO authenticated
USING (true);
