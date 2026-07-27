import { createHash } from "node:crypto";

/**
 * In-process TTL cache. Single instance is enough for a personal dashboard —
 * if this ever runs multi-node, swap the Map for Redis and keep the signature.
 */

type Entry = { value: Promise<unknown>; expiresAt: number };

const store = new Map<string, Entry>();
const MAX_ENTRIES = 500;

/** Cache keys are logged and held in memory — never key one on a raw token. */
export const tokenKey = (token: string) =>
  createHash("sha256").update(token).digest("hex").slice(0, 16);

export function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);

  if (hit && hit.expiresAt > now) {
    return hit.value as Promise<T>;
  }

  // stored before awaiting, so concurrent callers share one request
  const value = load().catch((error) => {
    store.delete(key); // a failed load must not be served for the whole TTL
    throw error;
  });

  if (store.size >= MAX_ENTRIES) {
    for (const [entryKey, entry] of store) {
      if (entry.expiresAt <= now) {
        store.delete(entryKey);
      }
    }
  }

  store.set(key, { value, expiresAt: now + ttlMs });

  return value;
}

export const clearCache = () => store.clear();
