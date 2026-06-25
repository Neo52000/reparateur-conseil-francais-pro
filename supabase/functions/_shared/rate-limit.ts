/**
 * Lightweight per-worker IP rate limiter for Supabase Edge Functions.
 *
 * Uses an in-memory sliding-window counter (Map) scoped to a single worker
 * instance. This is intentionally simple — it blocks burst abuse from a
 * single IP within one worker's lifetime without requiring DB/KV changes.
 * Across many workers a determined attacker can still saturate, so this is
 * a defense-in-depth layer, not a replacement for `verify_jwt`.
 */

import { buildCorsHeaders } from "./cors.ts";

interface Window {
  start: number; // ms epoch
  count: number;
}

interface Bucket {
  windows: Map<string, Window>; // key -> window
}

const buckets = new Map<string, Bucket>(); // namespace -> bucket

// Worker-process budget for tracked IPs per bucket. Once exceeded we evict
// expired windows so the Map cannot grow unbounded across reused workers.
const PRUNE_THRESHOLD = 1000;

function pruneExpired(bucket: Bucket, now: number, windowMs: number): void {
  const cutoff = now - windowMs;
  for (const [ip, w] of bucket.windows) {
    if (w.start < cutoff) bucket.windows.delete(ip);
  }
}

interface RateLimitOptions {
  /** Logical bucket name (e.g. function name). */
  namespace: string;
  /** Max requests allowed per window. */
  limit: number;
  /** Window length in ms. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Check rate limit for the request's client IP. Does NOT short-circuit —
 * call `enforceRateLimit` to get a ready-to-return 429 response on failure.
 */
export function checkRateLimit(req: Request, opts: RateLimitOptions): RateLimitResult {
  const ip = getClientIp(req);
  const now = Date.now();

  let bucket = buckets.get(opts.namespace);
  if (!bucket) {
    bucket = { windows: new Map() };
    buckets.set(opts.namespace, bucket);
  } else if (bucket.windows.size > PRUNE_THRESHOLD) {
    pruneExpired(bucket, now, opts.windowMs);
  }

  const w = bucket.windows.get(ip);
  if (!w || now - w.start >= opts.windowMs) {
    bucket.windows.set(ip, { start: now, count: 1 });
    return { allowed: true, remaining: opts.limit - 1, retryAfterMs: 0 };
  }

  w.count += 1;
  if (w.count > opts.limit) {
    const retryAfterMs = Math.max(0, opts.windowMs - (now - w.start));
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  return { allowed: true, remaining: Math.max(0, opts.limit - w.count), retryAfterMs: 0 };
}

/**
 * Convenience: returns a Response when over-limit, otherwise null.
 */
export function enforceRateLimit(req: Request, opts: RateLimitOptions): Response | null {
  const result = checkRateLimit(req, opts);
  if (result.allowed) return null;
  const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
  return new Response(
    JSON.stringify({
      success: false,
      error: "rate_limited",
      message: `Too many requests. Retry after ${retryAfterSec}s.`,
    }),
    {
      status: 429,
      headers: {
        ...buildCorsHeaders(req),
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}
