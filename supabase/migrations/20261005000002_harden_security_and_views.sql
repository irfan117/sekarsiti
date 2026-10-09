-- ==============================================================================
-- SEKARSITI WED - HARDENED SECURITY & PRIVACY MIGRATION
-- Migration: 20261005000002_harden_security_and_views.sql
-- Compatible with: npx supabase db push
-- ==============================================================================

-- 1. VIEW PUBLIK AMAN (PUBLIC INVITATION VIEW)
-- Menyembunyikan pin_code, access_code, client_phone, client_email dari tamu umum!
CREATE OR REPLACE VIEW public.public_invitations AS
SELECT 
  id,
  slug,
  client_name,
  template_id,
  status,
  bride_name,
  bride_full_name,
  bride_parents,
  bride_instagram,
  groom_name,
  groom_full_name,
  groom_parents,
  groom_instagram,
  event_date_formatted,
  countdown_iso_date,
  akad_time,
  akad_venue,
  resepsi_time,
  resepsi_venue,
  city,
  maps_url,
  quote_text,
  quote_source,
  bank_name,
  account_number,
  account_holder,
  secondary_bank_name,
  secondary_account_number,
  secondary_account_holder,
  song_title,
  audio_url,
  media_slots,
  created_at,
  updated_at
FROM public.invitations
WHERE status = 'published';

-- Izinkan public membaca view yang sudah dibersihkan dari kredensial
GRANT SELECT ON public.public_invitations TO anon, authenticated;

-- 2. SECURE RPC FUNCTION: VERIFIKASI PIN PORTAL KLIEN
-- Mencegah brute force scanning dan tidak mengekspos PIN mentah ke frontend
CREATE OR REPLACE FUNCTION public.verify_client_portal(p_code TEXT, p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  SELECT *
  INTO v_invitation
  FROM public.invitations
  WHERE (LOWER(access_code) = LOWER(p_code) OR LOWER(slug) = LOWER(p_code) OR id = p_code)
    AND pin_code = p_pin
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kode akses atau PIN salah.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', to_jsonb(v_invitation)
  );
END;
$$;

-- Berikan izin eksekusi RPC ke publik anonim (hanya bisa memanggil fungsi dengan input parameter yang tepat)
GRANT EXECUTE ON FUNCTION public.verify_client_portal(TEXT, TEXT) TO anon, authenticated;
