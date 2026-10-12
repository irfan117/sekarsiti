-- Clear deprecated Google Actions Sounds URLs (404) from music library & invitations.
-- Admin/portal should upload real audio to Cloudinary instead.

UPDATE public.music_tracks
SET audio_url = ''
WHERE audio_url ILIKE '%actions.google.com/sounds%';

-- Remove unusable seed rows that no longer have a playable URL
DELETE FROM public.music_tracks
WHERE audio_url IS NULL OR audio_url = '';

UPDATE public.invitations
SET audio_url = NULL
WHERE audio_url ILIKE '%actions.google.com/sounds%';
