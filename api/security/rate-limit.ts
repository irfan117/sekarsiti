import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';

type VercelRequest = {
  method?: string;
  url?: string;
  query: { action?: string | string[] };
  body?: { scope?: unknown };
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

const policies = {
  login: { requests: 10, window: '15 m', windowMs: 15 * 60 * 1000 },
  guestbook: { requests: 10, window: '1 h', windowMs: 60 * 60 * 1000 },
  rsvp: { requests: 10, window: '1 h', windowMs: 60 * 60 * 1000 },
} as const;

type PolicyAction = keyof typeof policies;

let limiterCache: Record<string, Ratelimit> | undefined;
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function getLimiters(): Record<string, Ratelimit> | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  if (limiterCache) return limiterCache;

  const redis = new Redis({ url, token });
  limiterCache = Object.fromEntries(
    Object.entries(policies).map(([action, policy]) => [
      action,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(policy.requests, policy.window),
        prefix: `sekarsiti:ratelimit:v2:${action}`,
        analytics: false,
      }),
    ])
  );
  return limiterCache;
}

function checkMemoryRateLimit(action: PolicyAction, clientKey: string) {
  const policy = policies[action];
  const now = Date.now();
  const bucketKey = `${action}:${clientKey}`;
  const existing = memoryBuckets.get(bucketKey);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + policy.windowMs;
    memoryBuckets.set(bucketKey, { count: 1, resetAt });
    return {
      success: true,
      limit: policy.requests,
      remaining: policy.requests - 1,
      reset: resetAt,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, policy.requests - existing.count);
  return {
    success: existing.count <= policy.requests,
    limit: policy.requests,
    remaining,
    reset: existing.resetAt,
  };
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  const ip = firstForwarded?.trim() || 'unknown';
  const rawScope = typeof req.body?.scope === 'string' ? req.body.scope : '';
  const scope = rawScope.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);
  return createHash('sha256').update(`${ip}:${scope}`).digest('hex');
}

function resolveAction(req: VercelRequest): string | undefined {
  const fromQuery = Array.isArray(req.query?.action) ? req.query.action[0] : req.query?.action;
  if (fromQuery) return fromQuery;

  if (req.url) {
    const pathname = req.url.split('?')[0].replace(/\/+$/, '');
    const parts = pathname.split('/');
    const lastSegment = parts[parts.length - 1];
    if (lastSegment && lastSegment !== 'rate-limit') {
      return lastSegment;
    }
  }
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method?.toUpperCase() !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const action = resolveAction(req);
  if (!action || !Object.hasOwn(policies, action)) {
    return res.status(404).json({ error: 'Jenis permintaan tidak dikenal.' });
  }

  const typedAction = action as PolicyAction;
  const clientKey = getClientIp(req);
  const limiters = getLimiters();

  try {
    const result = limiters
      ? await limiters[typedAction].limit(clientKey)
      : checkMemoryRateLimit(typedAction, clientKey);

    res.setHeader('RateLimit-Limit', String(result.limit));
    res.setHeader('RateLimit-Remaining', String(result.remaining));
    if (!result.success) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))));
      const message = typedAction === 'login'
        ? 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.'
        : typedAction === 'guestbook'
          ? 'Terlalu banyak kiriman ucapan untuk undangan ini. Coba lagi dalam satu jam.'
          : 'Terlalu banyak perubahan reservasi untuk undangan ini. Coba lagi dalam satu jam.';
      return res.status(429).json({ error: message });
    }
    return res.status(204).end();
  } catch {
    const fallbackResult = checkMemoryRateLimit(typedAction, clientKey);
    res.setHeader('RateLimit-Limit', String(fallbackResult.limit));
    res.setHeader('RateLimit-Remaining', String(fallbackResult.remaining));
    if (!fallbackResult.success) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((fallbackResult.reset - Date.now()) / 1000))));
      return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' });
    }
    return res.status(204).end();
  }
}
