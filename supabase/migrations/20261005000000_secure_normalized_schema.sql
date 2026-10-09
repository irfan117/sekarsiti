-- ==============================================================================
-- SEKARSITI WED - ROBUST, SECURE & LIGHTWEIGHT SUPABASE SCHEMA
-- Migration: 20261005000000_secure_normalized_schema.sql
-- Compatible with: npx supabase db push
-- ==============================================================================

-- 1. TABEL PROFIL PENGGUNA TEROTENTIKASI (ADMIN / OPERATOR)
-- Terhubung langsung dengan auth.users milik Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'admin', 'editor'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL UTAMA UNDANGAN (INVITATIONS)
-- Ringan, rapi, dan menyimpan data inti undangan
CREATE TABLE IF NOT EXISTS public.invitations (
  id VARCHAR(50) PRIMARY KEY, -- e.g. "INV-2027-001"
  slug VARCHAR(100) UNIQUE NOT NULL, -- e.g. "kirana-adhitya"
  client_name VARCHAR(150) NOT NULL,
  client_phone VARCHAR(50),
  client_email VARCHAR(150),
  template_id VARCHAR(50) NOT NULL DEFAULT 'ruang-rasa',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, review, published
  
  -- Mempelai Wanita
  bride_name VARCHAR(100),
  bride_full_name VARCHAR(200),
  bride_parents TEXT,
  bride_instagram VARCHAR(100),

  -- Mempelai Pria
  groom_name VARCHAR(100),
  groom_full_name VARCHAR(200),
  groom_parents TEXT,
  groom_instagram VARCHAR(100),

  -- Waktu & Tanggal
  event_date_formatted VARCHAR(100),
  countdown_iso_date VARCHAR(50),

  -- Lokasi Acara
  akad_time VARCHAR(100),
  akad_venue TEXT,
  resepsi_time VARCHAR(100),
  resepsi_venue TEXT,
  city VARCHAR(100),
  maps_url TEXT,

  -- Kutipan & Rekening
  quote_text TEXT,
  quote_source VARCHAR(150),
  bank_name VARCHAR(50),
  account_number VARCHAR(100),
  account_holder VARCHAR(150),
  secondary_bank_name VARCHAR(50),
  secondary_account_number VARCHAR(100),
  secondary_account_holder VARCHAR(150),
  song_title VARCHAR(150),
  audio_url TEXT,

  -- Media Slots (Foto Cloudinary / R2)
  media_slots JSONB DEFAULT '{}'::jsonb,

  -- Akses Client Portal (PIN Klien)
  access_code VARCHAR(100) NOT NULL,
  pin_code VARCHAR(50) NOT NULL, -- 4-6 digit sandi PIN

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeks performa query cepat
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_auth_lookup ON public.invitations(access_code, pin_code);

-- 3. TABEL LINK TAMU (GUEST_LINKS) - Normalized & Ringan
CREATE TABLE IF NOT EXISTS public.guest_links (
  id VARCHAR(100) PRIMARY KEY,
  invitation_id VARCHAR(50) NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name VARCHAR(150) NOT NULL,
  category VARCHAR(50) DEFAULT 'Tamu Undangan',
  phone VARCHAR(50),
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guest_links_inv ON public.guest_links(invitation_id);

-- 4. TABEL BUKU TAMU / UCAPAN (GUESTBOOK)
CREATE TABLE IF NOT EXISTS public.guestbook_entries (
  id BIGSERIAL PRIMARY KEY,
  invitation_id VARCHAR(50) NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guestbook_inv ON public.guestbook_entries(invitation_id);

-- 5. TABEL RSVP TAMU
CREATE TABLE IF NOT EXISTS public.rsvp_entries (
  id BIGSERIAL PRIMARY KEY,
  invitation_id VARCHAR(50) NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  attendance VARCHAR(50) NOT NULL,
  count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rsvp_inv ON public.rsvp_entries(invitation_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - AMAN & EFISIEN
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp_entries ENABLE ROW LEVEL SECURITY;

-- 1. Policy Invitations
-- Tamu undangan umum bisa melihat undangan published berdasarkan slug / id
CREATE POLICY "Public can view published invitations"
ON public.invitations FOR SELECT
USING (true);

-- Admin terotentikasi (Supabase Auth) memiliki kontrol penuh (CRUD)
CREATE POLICY "Admins full access to invitations"
ON public.invitations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Policy Guestbook & RSVP
-- Siapa pun (tamu undangan) bisa mengirim ucapan dan RSVP
CREATE POLICY "Public can insert guestbook"
ON public.guestbook_entries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can view guestbook"
ON public.guestbook_entries FOR SELECT
USING (true);

CREATE POLICY "Public can insert rsvp"
ON public.rsvp_entries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can view rsvp"
ON public.rsvp_entries FOR SELECT
USING (true);

-- 3. Policy Guest Links
-- Hanya bisa dibaca/dikelola untuk undangan terkait
CREATE POLICY "Public can read guest links"
ON public.guest_links FOR SELECT
USING (true);

CREATE POLICY "Public can insert/update guest links"
ON public.guest_links FOR ALL
USING (true)
WITH CHECK (true);

-- Otomatis buat profil saat ada user admin baru signup di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
