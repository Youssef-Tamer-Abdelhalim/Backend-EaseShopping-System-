const NodeCache = require("node-cache");

// TTL: 5 minutes. checkperiod: clean up expired keys every 60s.
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Middleware that caches GET responses in memory.
 * Cache key = full request URL (path + query string).
 * Only caches successful (2xx) responses.
 */
const cacheResponse = (req, res, next) => {
  if (req.method !== "GET") return next();

  const key = req.originalUrl;
  const cached = cache.get(key);
  if (cached) return res.status(200).json(cached);

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body);
    }
    return originalJson(body);
  };

  next();
};

/**
 * Middleware that clears all cached keys containing the given prefix.
 * Use on mutating routes (POST, PATCH, DELETE) to invalidate stale list caches.
 * Example: clearCache("/api/v1/categories")
 */
const clearCache = (prefix) => (req, res, next) => {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  if (keys.length) cache.del(keys);
  next();
};

module.exports = { cacheResponse, clearCache };
