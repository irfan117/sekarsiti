/**
 * Utility untuk mengunggah file gambar/media langsung ke Cloudinary dari client/browser
 * atau mengonversi URL Google Drive ke format direct thumbnail.
 */

export const isCloudinaryConfigured = Boolean(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);

/**
 * Mengecek apakah sebuah URL atau data URI merupakan file video
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:video/')) return true;
  if (/\/video\/upload\//i.test(trimmed)) return true;
  return /\.(mp4|webm|mov|m4v|ogv)(\?.*|#.*)?$/i.test(trimmed);
}

/**
 * Mengecek apakah objek File merupakan file video
 */
export function isVideoFile(file: File): boolean {
  if (file.type && file.type.startsWith('video/')) return true;
  return /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name || '');
}

function getCloudinaryUploadConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary belum dikonfigurasi. Harap isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET di file .env');
  }

  return { cloudName, uploadPreset };
}

/**
 * Mengonversi File gambar apa pun (JPG, PNG, HEIC, TIFF, BMP) menjadi format WebP modern langsung di browser.
 * Menghasilkan ukuran file 60-80% lebih kecil dengan kualitas visual terjaga sebelum diunggah atau disimpan.
 */
export async function convertImageFileToWebp(
  file: File,
  quality = 0.85,
  maxDimension = 2400
): Promise<File> {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  // Jika sudah webp dan ukurannya wajar, kembalikan langsung
  if (file.type === 'image/webp') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Skala proporsional jika resolusi melebihi maxDimension (misal foto kamera 6000px)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const baseName = file.name.replace(/\.[^/.]+$/, '') || 'foto';
            const webpFile = new File([blob], `${baseName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // fallback file asli jika image decoder gagal
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const { cloudName, uploadPreset } = getCloudinaryUploadConfig();
  const isVideo = isVideoFile(file);

  // Jika gambar, konversi otomatis ke WebP sebelum upload ke Cloudinary
  let uploadFile = file;
  if (!isVideo && file.type.startsWith('image/')) {
    try {
      uploadFile = await convertImageFileToWebp(file, 0.88);
    } catch {
      uploadFile = file;
    }
  }

  const buildFormData = () => {
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('upload_preset', uploadPreset);
    return formData;
  };

  if (isVideo) {
    const endpoints = [
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    ];

    let lastError = 'Gagal mengunggah video ke Cloudinary.';
    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: buildFormData(),
      });

      if (response.ok) {
        const data = await response.json();
        const url = (data.secure_url || data.url) as string | undefined;
        if (url) return url;
      } else {
        const errData = await response.json().catch(() => ({}));
        lastError = errData?.error?.message || `Gagal mengunggah video (${response.status}).`;
      }
    }

    throw new Error(lastError);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: buildFormData(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Gagal mengunggah gambar ke Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url as string;
}

export async function uploadAudioToCloudinary(file: File): Promise<string> {
  const { cloudName, uploadPreset } = getCloudinaryUploadConfig();

  // Cloudinary treats audio as video resource_type for unsigned uploads.
  const buildFormData = () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    return formData;
  };

  const endpoints = [
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
  ];

  let lastErrorMessage = 'Gagal mengunggah file musik ke Cloudinary.';

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: buildFormData(),
    });

    if (response.ok) {
      const data = await response.json();
      const url = (data.secure_url || data.url) as string | undefined;
      if (url) return url;
      lastErrorMessage = 'Cloudinary tidak mengembalikan URL audio.';
      continue;
    }

    const errData = await response.json().catch(() => ({}));
    lastErrorMessage =
      errData?.error?.message ||
      `Upload gagal (${response.status}) via ${endpoint.split('/').slice(-2).join('/')}.`;
    console.warn('Cloudinary audio upload attempt failed:', lastErrorMessage);
  }

  throw new Error(
    `${lastErrorMessage} Pastikan unsigned upload preset mengizinkan resource type Video/Raw/Auto.`
  );
}

function getSupportedWebmMimeType(): string {
  const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return mimeTypes.find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || 'audio/webm';
}

export async function convertAudioFileToWebm(file: File): Promise<File> {
  if (!file || !file.type.startsWith('audio/')) {
    throw new Error('File yang dipilih bukan format audio.');
  }

  const isAlreadyWebm = file.type === 'audio/webm' || file.name.toLowerCase().endsWith('.webm');
  if (isAlreadyWebm || typeof window === 'undefined' || typeof MediaRecorder === 'undefined' || !('AudioContext' in window)) {
    return file;
  }

  const audioContext = new window.AudioContext();
  try {
    const buffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    const source = audioContext.createBufferSource();
    const destination = audioContext.createMediaStreamDestination();
    const mimeType = getSupportedWebmMimeType();
    const recorder = new MediaRecorder(destination.stream, mimeType.includes('webm') ? { mimeType } : undefined);
    const chunks: BlobPart[] = [];

    await new Promise<void>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = (event) => reject(new Error((event as any)?.error?.name || 'Gagal merekam audio untuk konversi WebM.'));
      recorder.onstop = () => resolve();

      source.buffer = buffer;
      source.connect(destination);
      source.connect(audioContext.destination);
      source.onended = () => {
        recorder.stop();
      };

      recorder.start();
      source.start(0);
    });

    const outputBlob = new Blob(chunks, { type: 'audio/webm' });
    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'lagu-custom';
    return new File([outputBlob], `${baseName}.webm`, { type: 'audio/webm' });
  } finally {
    await audioContext.close().catch(() => undefined);
  }
}

/**
 * Optimasi otomatis URL Cloudinary untuk performa loading maksimal (WebP/AVIF & responsive width)
 */
export function getOptimizedImageUrl(url: string, width = 1200, quality = 'auto'): string {
  if (!url || typeof url !== 'string') return '';
  if (isVideoUrl(url)) return url;

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
