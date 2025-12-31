const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.useRedis = process.env.USE_REDIS === 'true';
    this.redisClient = null;
    this.memoryCache = new Map();
    this.redisFailed = false;
    this.loggedError = false;

    if (this.useRedis) {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redisClient = new Redis(redisUrl, {
        // Retry strategy: try 3 times, then give up to avoid log spam
        retryStrategy: (times) => {
          if (times > 3) {
            if (!this.loggedError) {
              console.warn('[Cache] Redis connection failed repeatedly. Permanently switching to in-memory cache.');
              this.loggedError = true;
              this.redisFailed = true;
            }
            return null; // Stop retrying
          }
          return Math.min(times * 100, 2000);
        },
        // Don't crash on connection error
        lazyConnect: true 
      });

      // Handle errors
      this.redisClient.on('error', (err) => {
        if (!this.loggedError) {
          console.warn(`[Cache] Redis connection warning: ${err.message}. Using in-memory fallback.`);
          this.loggedError = true; // Log once
        }
        this.redisFailed = true;
      });

      this.redisClient.on('connect', () => {
        console.log('[Cache] Connected to Redis successfully.');
        this.redisFailed = false;
        this.loggedError = false;
      });

      // Trigger connection
      this.redisClient.connect().catch(() => {
        // Catch initial connection error to prevent unhandled promise rejection
        // The 'error' event handler will also be triggered
      });

    } else {
      console.log('[Cache] Redis disabled (USE_REDIS!=true). Using in-memory cache.');
    }
  }

  /**
   * Get value from cache
   * @param {string} key 
   * @returns {Promise<string|null>}
   */
  async get(key) {
    // Try Redis first
    if (this.useRedis && !this.redisFailed && this.redisClient) {
      try {
        return await this.redisClient.get(key);
      } catch (err) {
        // Silent fail to memory
      }
    }

    // Fallback to Memory
    const item = this.memoryCache.get(key);
    if (item) {
      if (item.expiry > Date.now()) {
        return item.value;
      } else {
        this.memoryCache.delete(key);
      }
    }
    return null;
  }

  /**
   * Set value in cache
   * @param {string} key 
   * @param {string} value 
   * @param {number} ttlSeconds 
   */
  async set(key, value, ttlSeconds = 3600) {
    // Try Redis
    if (this.useRedis && !this.redisFailed && this.redisClient) {
      try {
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        // Silent fail to memory
      }
    }

    // Fallback to Memory
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
    
    // Simple cleanup: if cache gets too big, clear it (optional safety)
    if (this.memoryCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.memoryCache.entries()) {
        if (v.expiry < now) this.memoryCache.delete(k);
      }
    }
  }

  /**
   * Delete value from cache
   * @param {string} key 
   */
  async del(key) {
    if (this.useRedis && !this.redisFailed && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {}
    }
    this.memoryCache.delete(key);
  }
}

module.exports = new CacheService();
