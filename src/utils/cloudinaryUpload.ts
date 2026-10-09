/**
 * Utility untuk mengunggah file gambar/media langsung ke Cloudinary dari client/browser
 * atau mengonversi URL Google Drive ke format direct thumbnail jika diunggah via GForm.
 */

export const isCloudinaryConfigured = Boolean(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary belum dikonfigurasi. Harap isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET di file .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Gagal mengunggah gambar ke Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url as string;
}

/**
 * Optimasi otomatis URL Cloudinary untuk performa loading maksimal (WebP/AVIF & responsive width)
 */
export function getOptimizedImageUrl(url: string, width = 1200, quality = 'auto'): string {
  if (!url || typeof url !== 'string') return '';

  // Jika URL berasal dari Cloudinary
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transformation = `f_auto,q_${quality},w_${width},c_limit`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  // Jika URL Google Drive
  if (url.includes('drive.google.com')) {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
    }
  }

  return url;
}
