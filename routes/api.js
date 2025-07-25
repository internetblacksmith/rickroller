const express = require('express');
const router = express.Router();
const { 
  getCachedMetadata, 
  setCachedMetadata,
  getCacheStats 
} = require('../utils/metadataCache');
const { fetchFromAlternativeSources } = require('../utils/alternativeSources');
const logger = require('../utils/logger');

// Validate YouTube video ID
function isValidVideoId(videoId) {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

// Pre-warm cache endpoint
router.post('/warm-cache/:videoId', async (req, res) => {
  const { videoId } = req.params;
  
  // Validate video ID
  if (!isValidVideoId(videoId)) {
    return res.status(400).json({ 
      error: 'Invalid video ID',
      message: 'Video ID must be 11 characters long'
    });
  }

  // Check if already cached
  const cached = getCachedMetadata(videoId);
  if (cached) {
    logger.info(`Cache already warm for ${videoId}`);
    return res.json({ 
      status: 'already_cached',
      videoId,
      metadata: cached
    });
  }

  try {
    // Fetch metadata from alternative sources
    logger.info(`Warming cache for ${videoId}`);
    const metadata = await fetchFromAlternativeSources(videoId);
    
    if (metadata) {
      // Cache the metadata
      setCachedMetadata(videoId, metadata);
      
      return res.json({ 
        status: 'cached',
        videoId,
        metadata
      });
    } else {
      return res.status(404).json({ 
        error: 'Metadata not found',
        videoId
      });
    }
  } catch (error) {
    logger.error(`Error warming cache for ${videoId}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch metadata',
      message: error.message
    });
  }
});

// Get cache statistics
router.get('/cache-stats', (req, res) => {
  const stats = getCacheStats();
  res.json(stats);
});

// Get cached metadata for a video
router.get('/metadata/:videoId', (req, res) => {
  const { videoId } = req.params;
  
  if (!isValidVideoId(videoId)) {
    return res.status(400).json({ 
      error: 'Invalid video ID' 
    });
  }

  const metadata = getCachedMetadata(videoId);
  if (metadata) {
    res.json({ 
      cached: true,
      videoId,
      metadata 
    });
  } else {
    res.status(404).json({ 
      cached: false,
      videoId,
      message: 'Not in cache'
    });
  }
});

module.exports = router;