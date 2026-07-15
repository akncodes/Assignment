/**
 * CACHE LAYER
 *
 * In-process Map-based cache designed to be replaced with Redis.
 * TTLs: Stocks = 5 min, Mutual Funds = 24 hr, Benchmark = 5 min
 *
 * Redis migration path: swap CacheEntry storage to ioredis, keeping the same
 * get/set/invalidate interface intact.
 */

export interface CacheEntry<T> {
  data: T;
  cachedAt: number;  // epoch ms
  ttlMs: number;
}

export const CACHE_TTL = {
  STOCK: 5 * 60 * 1000,          // 5 minutes
  MUTUAL_FUND: 24 * 60 * 60 * 1000, // 24 hours
  BENCHMARK: 5 * 60 * 1000,      // 5 minutes
  HISTORY: 60 * 60 * 1000,       // 1 hour (historical data)
} as const;

class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const age = Date.now() - entry.cachedAt;
    if (age > entry.ttlMs) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, cachedAt: Date.now(), ttlMs });
  }

  /** Return stale data even if expired (used as last-resort fallback) */
  getStale<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    return entry ? entry.data : null;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Age in seconds of a cache entry (returns -1 if not found) */
  ageSeconds(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return -1;
    return Math.floor((Date.now() - entry.cachedAt) / 1000);
  }

  stats() {
    return {
      entries: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton – shared across all Route Handler invocations in the same process.
// On Vercel, each Edge/Node function has its own process; for production scale
// replace with Redis using the same interface.
const cache = new InMemoryCache();
export { cache };
