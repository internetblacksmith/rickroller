const express = require('express');
const router = express.Router();

// Debug endpoint to test spider detection and redirects
router.get('/test/:videoId', (req, res) => {
  const userAgent = req.get('user-agent') || 'No User-Agent';
  const isSpider = req.isSpider ? req.isSpider() : 'isSpider method not available';
  
  const debugInfo = {
    videoId: req.params.videoId,
    userAgent: userAgent,
    isSpider: isSpider,
    headers: req.headers,
    ip: req.ip,
    method: req.method,
    protocol: req.protocol,
    hostname: req.hostname,
    originalUrl: req.originalUrl
  };

  res.json(debugInfo);
});

// Test redirect endpoint
router.get('/redirect-test', (req, res) => {
  console.log('Redirect test accessed');
  console.log('User-Agent:', req.get('user-agent'));
  console.log('Is Spider:', req.isSpider ? req.isSpider() : 'unknown');
  
  res.redirect(302, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1');
});

// Force redirect test (ignores spider detection)
router.get('/force-redirect/:videoId', (req, res) => {
  console.log('Force redirect for:', req.params.videoId);
  res.redirect(302, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1');
});

module.exports = router;