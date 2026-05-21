class Cache {
  constructor(ttlMs = 5* 60 * 1000) {
    this.store = new Map();
    this.ttlMs = ttlMs;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, { value, timestamp: Date.now() });
  }

  has(key) {
    return this.get(key) !== null;
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