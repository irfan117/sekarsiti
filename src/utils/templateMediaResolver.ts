import { ClientInvitationData } from '../types/clientInvitation';
import { isVideoUrl } from './cloudinaryUpload';

/**
 * Mengumpulkan seluruh URL foto asli (non-video) yang diunggah oleh Admin pada undangan klien.
 * Digunakan agar seluruh bagian template (Galeri, Panel Samping, Our Story, Spotlight, Closing)
 * murni menampilkan foto asli dari upload Admin tanpa mencampur foto stok pasangan lain.
 */
export function collectAdminUploadedPhotos(customData?: ClientInvitationData): string[] {
  if (!customData) return [];
  const slots = customData.mediaSlots || { galleryImages: [] };
  const collected: string[] = [];

  const addPhoto = (url?: string) => {
    if (url && typeof url === 'string' && url.trim() && !isVideoUrl(url) && !collected.includes(url)) {
      collected.push(url);
    }
  };

  addPhoto(slots.heroImage);
  addPhoto(slots.bridePortrait);
  addPhoto(slots.groomPortrait);
  addPhoto(slots.spotlightImage);
  addPhoto(slots.closingImage);
  (slots.leftPanelImages || []).forEach(addPhoto);
  (slots.filmstripImages || []).forEach(addPhoto);
  (slots.galleryImages || []).forEach(addPhoto);
  (slots.storyChapters || []).forEach((ch) => addPhoto(ch?.image));

  return collected;
}

