// SPDX-License-Identifier: GPL-3.0-only
// In-memory sliding-window rate limiter — single shared instance per runtime.
// NOTE: proxy.ts (middleware) and the Node.js server are separate runtimes;
// each runtime gets its own Map instance from this module. Within a runtime,
// every import shares the same singleton (auth throttle, register, setup).
// Single-instance deployments only — see proxy.ts for the Redis note.
const buckets = new Map<string, { count: number; lastReset: number }>();

export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

export const DEFAULT_LIMITS = {
  api: { max: 100, windowMs: 60 * 1000 },
  login: { max: 10, windowMs: 5 * 60 * 1000 },
  register: { max: 5, windowMs: 60 * 1000 },
} as const;

export function checkRateLimit(key: string, { max, windowMs }: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.lastReset > windowMs) {
    buckets.set(key, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

/**
 * Throttles are enforced only in production. Dev/e2e hammer login/register
 * endpoints in quick succession from a single IP and would false-positive.
 */
export function throttlingEnabled(): boolean {
  return process.env.NODE_ENV === "production";
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
