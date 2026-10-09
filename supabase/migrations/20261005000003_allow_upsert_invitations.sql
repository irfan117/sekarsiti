-- ==============================================================================
-- Migration: 20261005000003_allow_upsert_invitations.sql
-- Fix: Row Level Security policy to allow upsert/insert/update on invitations
-- Compatible with: npx supabase db push
-- ==============================================================================

-- Drop existing restricted policies if present
DROP POLICY IF EXISTS "Admins full access to invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow public upsert invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow anon upsert invitations" ON public.invitations;

-- Create policy allowing anon and authenticated users to insert/upsert invitations
CREATE POLICY "Allow anon and auth full access invitations"
ON public.invitations
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
