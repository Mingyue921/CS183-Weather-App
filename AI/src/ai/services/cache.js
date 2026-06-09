class Cache {
  constructor(ttlMs = 5 * 60 * 1000, maxSize = 500) {
    this.store = new Map();
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
  }


  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const stale = age > this.ttlMs;

    return { data: entry.value, stale };
  }

  getStale(key) {
    return this.get(key);
  }

  set(key, value) {
    this.evictIfNeeded();
    this.store.set(key, { value, timestamp: Date.now() });
  }

  
  evictIfNeeded() {
    while (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      } else {
        break;
      }
    }
  }

  has(key) {
    return this.store.has(key);
  }

  delete(key) {
    return this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}

module.exports = new Cache();
