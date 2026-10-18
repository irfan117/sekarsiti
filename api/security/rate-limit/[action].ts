import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';

type VercelRequest = {
  method?: string;
  query: { action?: string | string[] };
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

const policies = {
  login: { requests: 5, window: '15 m' },
  guestbook: { requests: 3, window: '10 m' },
  rsvp: { requests: 5, window: '10 m' },
} as const;

let limiterCache: Record<string, Ratelimit> | undefined;

function getLimiters(): Record<string, Ratelimit> | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (limiterCache) return limiterCache;

  const redis = new Redis({ url, token });
  limiterCache = Object.fromEntries(
    Object.entries(policies).map(([action, policy]) => [
      action,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(policy.requests, policy.window),
        prefix: `sekarsiti:ratelimit:${action}`,
        analytics: false,
      }),
    ])
  );
  return limiterCache;
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  const ip = firstForwarded?.trim() || 'unknown';
  return createHash('sha256').update(ip).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;
  if (!action || !(action in policies)) {
    return res.status(404).json({ error: 'Jenis permintaan tidak dikenal.' });
  }

  const limiters = getLimiters();
  if (!limiters) {
    return res.status(503).json({ error: 'Layanan keamanan belum dikonfigurasi.' });
  }

  try {
    const result = await limiters[action].limit(getClientIp(req));
    res.setHeader('RateLimit-Limit', String(result.limit));
    res.setHeader('RateLimit-Remaining', String(result.remaining));
    if (!result.success) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))));
      const message = action === 'login'
        ? 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.'
        : action === 'guestbook'
          ? 'Terlalu banyak kiriman ucapan. Coba lagi dalam 10 menit.'
          : 'Terlalu banyak perubahan reservasi. Coba lagi dalam 10 menit.';
      return res.status(429).json({ error: message });
    }
    return res.status(204).end();
  } catch {
    return res.status(503).json({ error: 'Layanan keamanan sementara tidak tersedia.' });
  }
}
