const express = require('express');
const router = express.Router();
const ogs = require('open-graph-scraper');

router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    // Test OGS functionality
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const { error } = await ogs({ url: testUrl, timeout: 5000 });
    
    health.services = {
      openGraphScraper: error ? 'degraded' : 'healthy'
    };
    
    res.json(health);
  } catch (error) {
    health.status = 'error';
    health.error = error.message;
    res.status(503).json(health);
  }
});

module.exports = router;