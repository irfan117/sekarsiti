-- Migration: Fix SECURITY DEFINER issue on public_invitations view
-- Timestamp: 20261011000001_fix_public_invitations_security_invoker.sql

-- Set security_invoker = true on public.public_invitations view so Postgres evaluates
-- permissions and RLS policies using the querying user (invoker) rather than the view creator (definer).
ALTER VIEW public.public_invitations SET (security_invoker = true);
