class Cache {
  constructor({
    maxSize = Infinity,
    ttl = 0,
    onEvict = null,
    onExpire = null,
  } = {}) {
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.onEvict = onEvict;
    this.onExpire = onExpire;
    this.cacheMap = new Map();
    this._cleanupInterval = null;

    if (this.ttl > 0) {
      this.startAutoCleanup();
    }
  }

  get(key) {
    if (!this.cacheMap.has(key)) {
      return undefined;
    }
    const { value, expiry } = this.cacheMap.get(key);

    if (expiry && Date.now() > expiry) {
      this.cacheMap.delete(key);
      if (typeof this.onExpire === "function") {
        this.onExpire(key, value);
      }
      return undefined;
    }

    this.cacheMap.delete(key);
    this.cacheMap.set(key, { value, expiry });

    return value;
  }

  set(key, value) {
    if (this.cacheMap.has(key)) {
      this.cacheMap.delete(key);
    } else if (this.cacheMap.size >= this.maxSize) {
      const firstKey = this.cacheMap.keys().next().value;
      const firstEntry = this.cacheMap.get(firstKey);
      this.cacheMap.delete(firstKey);
      if (typeof this.onEvict === "function") {
        this.onEvict(firstKey, firstEntry.value);
      }
    }

    const expiry = this.ttl > 0 ? Date.now() + this.ttl : 0;
    this.cacheMap.set(key, { value, expiry });
  }

  delete(key) {
    return this.cacheMap.delete(key);
  }

  clear() {
    this.cacheMap.clear();
  }

  get size() {
    this._cleanupExpired();
    return this.cacheMap.size;
  }

  has(key) {
    if (!this.cacheMap.has(key)) {
      return false;
    }
    const { expiry } = this.cacheMap.get(key);
    if (expiry && Date.now() > expiry) {
      this.cacheMap.delete(key);
      if (typeof this.onExpire === "function") {
        this.onExpire(key, this.cacheMap.get(key).value);
      }
      return false;
    }
    return true;
  }

  forEach(callback, thisArg = undefined) {
    for (const [key, { value, expiry }] of this.cacheMap) {
      if (!expiry || Date.now() <= expiry) {
        callback.call(thisArg, value, key, this);
      }
    }
  }

  keys() {
    return this.cacheMap.keys();
  }

  values() {
    const valuesIterator = this.cacheMap.values();
    return (function* () {
      for (const { value, expiry } of valuesIterator) {
        if (!expiry || Date.now() <= expiry) {
          yield value;
        }
      }
    })();
  }

  entries() {
    const entriesIterator = this.cacheMap.entries();
    return (function* () {
      for (const [key, { value, expiry }] of entriesIterator) {
        if (!expiry || Date.now() <= expiry) {
          yield [key, value];
        }
      }
    })();
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  _cleanupExpired() {
    const now = Date.now();
    for (const [key, { value, expiry }] of this.cacheMap) {
      if (expiry && now > expiry) {
        this.cacheMap.delete(key);
        if (typeof this.onExpire === "function") {
          this.onExpire(key, value);
        }
      }
    }
  }

  startAutoCleanup(interval = 60000) {
    if (this._cleanupInterval) return;
    this._cleanupInterval = setInterval(() => {
      this._cleanupExpired();
    }, interval);
  }

  stopAutoCleanup() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
  }
}
