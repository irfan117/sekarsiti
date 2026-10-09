-- ==============================================================================
-- Migration: 20261005000004_add_jsonb_columns_to_invitations.sql
-- Add JSONB columns to invitations table so AdminStore can store guest_links,
-- guestbook_entries, and rsvp_list directly, matching the frontend application schema.
-- ==============================================================================

ALTER TABLE public.invitations 
  ADD COLUMN IF NOT EXISTS guest_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS guestbook_entries JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rsvp_list JSONB DEFAULT '[]'::jsonb;
