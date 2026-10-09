-- ==============================================================================
-- SEKARSITI WED - SUPABASE DATABASE INITIALIZATION SCRIPT
-- ==============================================================================
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. TABEL UTAMA: INVITATIONS (Menyimpan seluruh data pesanan undangan klien)
CREATE TABLE IF NOT EXISTS public.invitations (
  id VARCHAR(50) PRIMARY KEY, -- Contoh: "INV-2027-001"
  slug VARCHAR(100) UNIQUE NOT NULL, -- Contoh: "kirana-adhitya"
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

  -- Tanggal & Countdown Acara
  event_date_formatted VARCHAR(100),
  countdown_iso_date VARCHAR(50),

  -- Rangkaian Acara
  akad_time VARCHAR(100),
  akad_venue TEXT,
  resepsi_time VARCHAR(100),
  resepsi_venue TEXT,
  city VARCHAR(100),
  maps_url TEXT,

  -- Kutipan Suci & Rekening Tanda Kasih
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

  -- Slot Media (Hero, Potret, Galeri Foto Cloudinary)
  media_slots JSONB DEFAULT '{}'::jsonb,

  -- Keamanan & Akses Portal Mandiri Mempelai
  access_code VARCHAR(100),
  pin_code VARCHAR(20),

  -- Daftar Tamu, Ucapan, dan RSVP
  guest_links JSONB DEFAULT '[]'::jsonb,
  guestbook_entries JSONB DEFAULT '[]'::jsonb,
  rsvp_list JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk mempercepat query pencarian publik
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_access ON public.invitations(access_code, pin_code);

-- Aktifkan Row Level Security (RLS) dengan akses publik teratur
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Izinkan baca publik untuk menampilkan undangan dan portal
CREATE POLICY "Allow public read invitations" 
ON public.invitations FOR SELECT 
USING (true);

-- Policy: Izinkan insert/update (untuk admin dan sinkronisasi)
CREATE POLICY "Allow public upsert invitations" 
ON public.invitations FOR ALL 
USING (true)
WITH CHECK (true);
