-- Migration: create portfolio_items table for Showcase Portfolio feature
-- Timestamp: 20261011000000

CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    slug VARCHAR NOT NULL UNIQUE,
    source_invitation_id VARCHAR REFERENCES public.invitations(id) ON DELETE SET NULL,
    template_id VARCHAR NOT NULL DEFAULT 'ruang-rasa',
    cover_image TEXT,
    hero_image TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    song_title VARCHAR,
    audio_url TEXT,
    quote_text TEXT,
    quote_source VARCHAR,
    bride_name VARCHAR NOT NULL,
    groom_name VARCHAR NOT NULL,
    event_date VARCHAR,
    city VARCHAR,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_client_approved BOOLEAN NOT NULL DEFAULT true, -- Default true because admin manages approval manually in early stage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast catalog queries
CREATE INDEX IF NOT EXISTS idx_portfolio_published_approved 
ON public.portfolio_items(is_published, is_client_approved) 
WHERE is_published = true AND is_client_approved = true;

CREATE INDEX IF NOT EXISTS idx_portfolio_source_invitation 
ON public.portfolio_items(source_invitation_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_slug 
ON public.portfolio_items(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Allow anyone (anon + authenticated) to view published and client-approved items
CREATE POLICY "Public can view published and approved portfolio items"
ON public.portfolio_items FOR SELECT
USING (is_published = true AND is_client_approved = true);

-- 2. Admin / Anon fallback Policy for managing portfolio items in early stage or authenticated admin
-- Note: Matching existing codebase security pattern where public anon key can perform write operations when admin dashboard is used or authenticated
CREATE POLICY "Allow write operations for portfolio items"
ON public.portfolio_items FOR ALL
USING (true)
WITH CHECK (true);
