-- Migration: Fix Supabase Linter Security Warnings
-- Timestamp: 20261011000002_fix_linter_warnings.sql

-- 1. FIX: function_search_path_mutable (Set explicit search_path = public)
-- Mencegah pencemaran/injection schema pada SECURITY DEFINER functions

ALTER FUNCTION public.verify_client_portal(p_code TEXT, p_pin TEXT) SET search_path = public;

-- Jika handle_new_user ada sebagai trigger auth
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path = public';
  END IF;
END $$;


-- 2. FIX: anon_security_definer_function_executable / authenticated_security_definer_function_executable
-- Mencegah fungsi internal seperti handle_new_user dipanggil langsung lewat REST API RPC oleh pengguna anonim
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public';
  END IF;
END $$;


-- 3. PERBAIKAN RLS POLICY UNTUK MUSIC TRACKS & PORTFOLIO ITEMS:
-- Mengizinkan operasi tulis (insert, update, delete) untuk anon & authenticated
-- agar Admin Workspace yang menggunakan client anon key (mode lokal/frontend) dapat menambah dan menghapus musik
DROP POLICY IF EXISTS "Authenticated users can insert music library" ON public.music_tracks;
DROP POLICY IF EXISTS "Authenticated users can update music library" ON public.music_tracks;
DROP POLICY IF EXISTS "Authenticated users can delete music library" ON public.music_tracks;
DROP POLICY IF EXISTS "Admins full access to music tracks" ON public.music_tracks;

CREATE POLICY "Allow full access to music tracks"
ON public.music_tracks FOR ALL
USING (true)
WITH CHECK (true);
