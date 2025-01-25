const express = require('express');
const router = express.Router();
const ogs = require('open-graph-scraper');
const { withRetry } = require('../utils/retry');
const { getNextProxy } = require('../config/proxy');
const { getRandomUserAgent } = require('../config/userAgents');
const { 
  getCachedMetadata, 
  setCachedMetadata, 
  waitForThrottle,
  getCacheStats 
} = require('../utils/metadataCache');
const logger = require('../utils/logger');
const { fetchFromAlternativeSources } = require('../utils/alternativeSources');

const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1';
const YOUTUBE_BASE_URL = 'https://www.youtube.com/watch?v=';

// Fallback metadata for when everything fails
const FALLBACK_METADATA = {
  ogTitle: 'YouTube Video',
  ogDescription: 'Watch this video on YouTube',
  ogImage: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
  ogSiteName: 'YouTube'
};

// Pre-cached popular video metadata to reduce requests
const STATIC_METADATA = {
  'dQw4w9WgXcQ': {
    ogTitle: 'Rick Astley - Never Gonna Give You Up (Official Video)',
    ogDescription: 'The official video for "Never Gonna Give You Up" by Rick Astley',
    ogImage: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
    ogSiteName: 'YouTube'
  }
};

async function fetchMetadataWithProtection(videoId) {
  // Check static cache first
  if (STATIC_METADATA[videoId]) {
    logger.info(`Using static metadata for ${videoId}`);
    return STATIC_METADATA[videoId];
  }

  // Check dynamic cache
  const cached = getCachedMetadata(videoId);
  if (cached) {
    logger.info(`Cache hit for ${videoId}`);
    return cached;
  }

  // Wait for throttle to avoid rate limiting
  await waitForThrottle();

  const options = { 
    url: `${YOUTUBE_BASE_URL}${videoId}`,
    customMetaTags: [
      { multiple: false, property: 'fb:app_id', fieldName: 'fbAppId' },
      { multiple: false, property: 'og:video:secure_url', fieldName: 'ogVideoSecureUrl' },
      { multiple: true, property: 'og:video:tag', fieldName: 'ogVideoTag' }
    ],
    timeout: 8000,
    retry: 2,
    headers: {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  };

  // Add proxy if available
  const proxy = getNextProxy();
  if (proxy) {
    options.proxy = proxy;
    logger.info(`Using proxy for ${videoId}`);
  }

  try {
    const ogsResponse = await withRetry(
      async () => {
        const response = await ogs(options);
        if (response.error) {
          // Check if it's a blocking error
          if (response.error.includes('429') || response.error.includes('403')) {
            logger.error(`YouTube blocking detected for ${videoId}: ${response.error}`);
            throw new Error('BLOCKED');
          }
          throw new Error(response.error);
        }
        return response;
      },
      {
        maxRetries: 2,
        delay: 1000,
        backoff: 2,
        onRetry: (attempt, error) => {
          logger.warn(`OGS attempt ${attempt} failed for ${videoId}:`, error.message);
          // If blocked, wait longer
          if (error.message === 'BLOCKED') {
            return new Promise(resolve => setTimeout(resolve, 5000 * attempt));
          }
        }
      }
    );
    
    const metadata = ogsResponse.result;
    
    // Cache successful result
    setCachedMetadata(videoId, metadata);
    logger.info(`Successfully fetched and cached metadata for ${videoId}`);
    
    return metadata;
  } catch (error) {
    logger.error(`OGS failed for ${videoId}:`, error);
    
    // Try alternative sources
    try {
      const altMetadata = await fetchFromAlternativeSources(videoId);
      setCachedMetadata(videoId, altMetadata);
      return altMetadata;
    } catch (altError) {
      logger.error(`All sources failed for ${videoId}:`, altError);
      
      // Return fallback but with the specific video URL
      return { 
        ...FALLBACK_METADATA, 
        ogUrl: `${YOUTUBE_BASE_URL}${videoId}`,
        ogTitle: `Video: ${videoId}` 
      };
    }
  }
}

router.get('/:videoId', async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userAgent = req.get('user-agent') || 'Unknown';
    const isSpider = req.isSpider ? req.isSpider() : false;
    
    // Enhanced logging
    logger.info(`Video request for ${videoId}`, {
      userAgent,
      isSpider,
      ip: req.ip,
      referer: req.get('referer'),
      headers: req.headers
    });
    
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
      logger.warn(`Invalid video ID: ${videoId}`);
      return res.status(400).json({ error: 'Invalid video ID' });
    }

    if (isSpider) {
      logger.info(`Spider detected for ${videoId}, showing metadata`);
      
      try {
        const result = await fetchMetadataWithProtection(videoId);
        
        res.render('video', {
          title: result.ogTitle || 'Video',
          result,
          layout: false
        });
      } catch (error) {
        logger.error('Error rendering video metadata:', error);
        
        // Even if everything fails, show something
        res.render('video', {
          title: 'Video',
          result: FALLBACK_METADATA,
          layout: false
        });
      }
    } else {
      logger.info(`Human user detected for ${videoId}, redirecting to rickroll`);
      
      // Try different redirect methods
      if (req.query.method === 'meta') {
        // Method 1: Meta refresh
        res.send(`<html><head><meta http-equiv="refresh" content="0; url=${RICKROLL_URL}"></head><body>Redirecting...</body></html>`);
      } else if (req.query.method === 'js') {
        // Method 2: JavaScript redirect
        res.send(`<html><body><script>window.location.href='${RICKROLL_URL}';</script></body></html>`);
      } else {
        // Method 3: Standard HTTP redirect (default)
        res.redirect(302, RICKROLL_URL);
      }
    }
  } catch (err) {
    logger.error('Unexpected error in video route:', err);
    next(err);
  }
});

// Admin endpoint to check cache stats
router.get('/admin/cache-stats', (req, res) => {
  res.json({
    cache: getCacheStats(),
    staticMetadataCount: Object.keys(STATIC_METADATA).length
  });
});

// Test endpoint to force behavior
router.get('/test/:videoId/:mode', (req, res) => {
  const { videoId, mode } = req.params;
  
  if (mode === 'spider') {
    res.render('video', {
      title: 'Test Spider View',
      result: STATIC_METADATA['dQw4w9WgXcQ'] || FALLBACK_METADATA,
      layout: false
    });
  } else if (mode === 'human') {
    res.redirect(302, RICKROLL_URL);
  } else {
    res.json({ error: 'Invalid mode. Use "spider" or "human"' });
  }
});

module.exports = router;