import type { Request, Response } from 'express';
import crypto from 'crypto';

export async function handleDeleteCloudinaryAsset(req: Request, res: Response) {
  try {
    const { publicId, resourceType = 'image' } = req.body || {};

    if (!publicId) {
      res.status(400).json({ error: 'publicId wajib disertakan.' });
      return;
    }

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.VITE_CLOUDINARY_CLOUD_NAME ||
      'dgtphydba';
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.warn(
        '[Cloudinary Delete] CLOUDINARY_API_KEY atau CLOUDINARY_API_SECRET belum diisi di .env. File remote tidak dihapus.'
      );
      res.status(200).json({
        success: false,
        warning:
          'CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET belum dikonfigurasi di Environment. File tidak dihapus di remote storage.',
      });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
    const response = await fetch(destroyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data: any = await response.json().catch(() => ({}));
    res.status(response.status).json({
      success: response.ok,
      result: data.result || data,
    });
  } catch (err: any) {
    console.error('[Cloudinary Delete Exception]:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

export default async function handler(req: any, res: any) {
  return handleDeleteCloudinaryAsset(req, res);
}
