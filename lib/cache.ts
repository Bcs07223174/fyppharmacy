// Simple in-memory cache for reducing Firestore reads
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(pattern?: string) {
    if (!pattern) {
      this.store.clear();
    } else {
      const keysToDelete = Array.from(this.store.keys()).filter((key) =>
        key.includes(pattern)
      );
      keysToDelete.forEach((key) => this.store.delete(key));
    }
  }
}

export const cache = new Cache();
