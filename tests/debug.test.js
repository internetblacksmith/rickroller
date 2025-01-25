const request = require('supertest');
const express = require('express');
const { enhancedSpiderDetector } = require('../middleware/spiderDetector');

describe('Debug Route Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(enhancedSpiderDetector());
    
    const debugRouter = require('../routes/debug');
    app.use('/debug', debugRouter);
  });

  describe('GET /debug/test/:videoId', () => {
    it('should return debug information', async () => {
      const res = await request(app)
        .get('/debug/test/dQw4w9WgXcQ')
        .set('User-Agent', 'Mozilla/5.0 Test Browser')
        .set('X-Custom-Header', 'test-value');

      expect(res.status).toBe(200);
      expect(res.body.videoId).toBe('dQw4w9WgXcQ');
      expect(res.body.userAgent).toBe('Mozilla/5.0 Test Browser');
      expect(res.body.isSpider).toBe(false);
      expect(res.body.headers).toBeDefined();
      expect(res.body.headers['user-agent']).toBe('Mozilla/5.0 Test Browser');
      expect(res.body.headers['x-custom-header']).toBe('test-value');
      expect(res.body.method).toBe('GET');
      expect(res.body.originalUrl).toBe('/debug/test/dQw4w9WgXcQ');
    });

    it('should detect spider correctly in debug info', async () => {
      const res = await request(app)
        .get('/debug/test/test123')
        .set('User-Agent', 'facebookexternalhit/1.1');

      expect(res.body.isSpider).toBe(true);
      expect(res.body.userAgent).toBe('facebookexternalhit/1.1');
    });

    it('should handle missing user agent', async () => {
      const res = await request(app)
        .get('/debug/test/test123');

      expect(res.body.userAgent).toBe('No User-Agent');
      expect(res.body.isSpider).toBeDefined();
    });
  });

  describe('GET /debug/redirect-test', () => {
    it('should perform redirect', async () => {
      const res = await request(app)
        .get('/debug/redirect-test')
        .set('User-Agent', 'Mozilla/5.0');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1');
    });

    it('should redirect even for spiders', async () => {
      const res = await request(app)
        .get('/debug/redirect-test')
        .set('User-Agent', 'facebookexternalhit/1.1');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1');
    });
  });

  describe('GET /debug/force-redirect/:videoId', () => {
    it('should force redirect regardless of user agent', async () => {
      const res = await request(app)
        .get('/debug/force-redirect/test123')
        .set('User-Agent', 'facebookexternalhit/1.1');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1');
    });

    it('should include video ID in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      await request(app)
        .get('/debug/force-redirect/special-video-id');

      expect(consoleSpy).toHaveBeenCalledWith('Force redirect for:', 'special-video-id');
      
      consoleSpy.mockRestore();
    });
  });
});