const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    res.set('X-Cache', 'HIT');
    return res.status(cached.status).send(cached.body);
  }

  const originalSend = res.send;
  res.send = function(body) {
    res.set('X-Cache', 'MISS');
    
    if (res.statusCode === 200) {
      cache.set(key, {
        body,
        status: res.statusCode,
        timestamp: Date.now()
      });
    }
    
    originalSend.call(this, body);
  };

  next();
};

const clearCache = () => {
  cache.clear();
};

module.exports = { cacheMiddleware, clearCache };