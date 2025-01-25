const request = require('supertest');
const app = require('../app');

// Mock external dependencies
jest.mock('open-graph-scraper');
jest.mock('../utils/logger');

const ogs = require('open-graph-scraper');

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full Application Flow', () => {
    it('should handle complete rickroll flow for humans', async () => {
      // Test home page
      const homeRes = await request(app).get('/');
      expect(homeRes.status).toBe(200);

      // Test video redirect for human
      const videoRes = await request(app)
        .get('/v/jNQXAC9IVRw')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0');
      
      expect(videoRes.status).toBe(302);
      expect(videoRes.headers.location).toContain('dQw4w9WgXcQ');
    });

    it('should handle complete metadata flow for bots', async () => {
      // Mock OGS response
      ogs.mockResolvedValue({
        error: false,
        result: {
          ogTitle: 'Me at the zoo',
          ogDescription: 'The first video on YouTube',
          ogImage: { url: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg' },
          ogSiteName: 'YouTube'
        }
      });

      // Test video metadata for bot
      const videoRes = await request(app)
        .get('/v/jNQXAC9IVRw')
        .set('User-Agent', 'facebookexternalhit/1.1');
      
      expect(videoRes.status).toBe(200);
      expect(videoRes.text).toContain('Me at the zoo');
      expect(videoRes.text).toContain('og:title');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const res = await request(app)
        .get('/non-existent-route');
      
      expect(res.status).toBe(404);
    });

    it('should handle invalid video IDs', async () => {
      const res = await request(app)
        .get('/v/invalid!')
        .set('User-Agent', 'Mozilla/5.0');
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid video ID');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to video routes', async () => {
      // Make many requests quickly
      const requests = [];
      for (let i = 0; i < 60; i++) {
        requests.push(
          request(app)
            .get(`/v/test${i}`)
            .set('User-Agent', 'Mozilla/5.0')
        );
      }

      const responses = await Promise.all(requests);
      
      // Some should be rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
      
      // Check rate limit headers
      const limitedResponse = rateLimited[0];
      expect(limitedResponse.headers).toHaveProperty('x-ratelimit-limit');
      expect(limitedResponse.headers).toHaveProperty('x-ratelimit-remaining');
    });

    it('should not rate limit spiders', async () => {
      // Make many spider requests
      const requests = [];
      for (let i = 0; i < 60; i++) {
        requests.push(
          request(app)
            .get(`/v/test${i}`)
            .set('User-Agent', 'facebookexternalhit/1.1')
        );
      }

      // Mock OGS to prevent actual requests
      ogs.mockResolvedValue({
        error: false,
        result: { ogTitle: 'Test' }
      });

      const responses = await Promise.all(requests);
      
      // None should be rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBe(0);
    });
  });

  describe('Health Monitoring', () => {
    it('should provide health status', async () => {
      ogs.mockResolvedValue({ error: false });

      const res = await request(app).get('/health');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.services).toBeDefined();
    });
  });

  describe('Debug Endpoints', () => {
    it('should provide debug information', async () => {
      const res = await request(app)
        .get('/debug/test/dQw4w9WgXcQ')
        .set('User-Agent', 'TestBot/1.0');
      
      expect(res.status).toBe(200);
      expect(res.body.videoId).toBe('dQw4w9WgXcQ');
      expect(res.body.userAgent).toBe('TestBot/1.0');
    });
  });

  describe('Cache Behavior', () => {
    it('should cache successful metadata fetches', async () => {
      // First request - should call OGS
      ogs.mockResolvedValue({
        error: false,
        result: {
          ogTitle: 'Cached Video',
          ogDescription: 'This should be cached'
        }
      });

      const res1 = await request(app)
        .get('/v/cache-test-123')
        .set('User-Agent', 'facebookexternalhit/1.1');
      
      expect(res1.status).toBe(200);
      expect(res1.text).toContain('Cached Video');
      expect(ogs).toHaveBeenCalledTimes(1);

      // Second request - should use cache
      const res2 = await request(app)
        .get('/v/cache-test-123')
        .set('User-Agent', 'twitterbot/1.0');
      
      expect(res2.status).toBe(200);
      expect(res2.text).toContain('Cached Video');
      
      // OGS should not be called again due to cache
      expect(ogs).toHaveBeenCalledTimes(1);
    });
  });

  describe('Alternative Redirect Methods', () => {
    it('should support meta refresh redirect', async () => {
      const res = await request(app)
        .get('/v/test123?method=meta')
        .set('User-Agent', 'Mozilla/5.0');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('<meta http-equiv="refresh"');
      expect(res.text).toContain('dQw4w9WgXcQ&autoplay=1');
    });

    it('should support JavaScript redirect', async () => {
      const res = await request(app)
        .get('/v/test123?method=js')
        .set('User-Agent', 'Mozilla/5.0');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('window.location.href=');
    });
  });
});