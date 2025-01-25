const NodeCache = require('node-cache');

// Cache metadata for 24 hours by default
const cache = new NodeCache({ 
  stdTTL: 86400, // 24 hours
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false // For better performance
});

// Track request times to implement throttling
const requestTimes = new Map();
const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests

function getCachedMetadata(videoId) {
  return cache.get(videoId);
}

function setCachedMetadata(videoId, metadata) {
  cache.set(videoId, metadata);
}

function canMakeRequest() {
  const now = Date.now();
  const lastRequest = requestTimes.get('last') || 0;
  
  if (now - lastRequest < MIN_REQUEST_INTERVAL) {
    return false;
  }
  
  requestTimes.set('last', now);
  return true;
}

async function waitForThrottle() {
  const now = Date.now();
  const lastRequest = requestTimes.get('last') || 0;
  const waitTime = MIN_REQUEST_INTERVAL - (now - lastRequest);
  
  if (waitTime > 0) {
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  requestTimes.set('last', Date.now());
}

function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
}

module.exports = {
  getCachedMetadata,
  setCachedMetadata,
  canMakeRequest,
  waitForThrottle,
  getCacheStats
};