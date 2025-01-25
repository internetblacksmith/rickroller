const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the external dependencies
jest.mock('open-graph-scraper');
jest.mock('../utils/logger');
jest.mock('../utils/alternativeSources');

const ogs = require('open-graph-scraper');
const { fetchFromAlternativeSources } = require('../utils/alternativeSources');

describe('Video Route Tests', () => {
  let app;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset cache
    jest.resetModules();
    
    // Create fresh app instance
    app = express();
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'pug');
    
    // Apply middleware
    const { enhancedSpiderDetector } = require('../middleware/spiderDetector');
    app.use(enhancedSpiderDetector());
    
    // Apply routes
    const videoRouter = require('../routes/video');
    app.use('/v', videoRouter);
    
    // Error handler
    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({ error: err.message });
    });
  });

  describe('GET /v/:videoId - Basic Functionality', () => {
    it('should redirect regular users to rickroll', async () => {
      const res = await request(app)
        .get('/v/dQw4w9WgXcQ')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1');
    });

    it('should return 400 for invalid video ID', async () => {
      const res = await request(app)
        .get('/v/invalid-id!')
        .set('User-Agent', 'Mozilla/5.0');
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid video ID');
    });

    it('should handle video IDs with correct format', async () => {
      const validIds = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', '_OBlgSz8sSM'];
      
      for (const id of validIds) {
        const res = await request(app)
          .get(`/v/${id}`)
          .set('User-Agent', 'Mozilla/5.0');
        
        expect(res.status).toBe(302);
      }
    });

    it('should handle empty video ID', async () => {
      const res = await request(app)
        .get('/v/')
        .set('User-Agent', 'Mozilla/5.0');
      
      expect(res.status).toBe(404);
    });
  });

  describe('GET /v/:videoId - Spider Detection', () => {
    it('should show metadata for Facebook crawler', async () => {
      // Mock OGS response
      ogs.mockResolvedValue({
        error: false,
        result: {
          ogTitle: 'Test Video',
          ogDescription: 'Test Description',
          ogImage: { url: 'https://example.com/image.jpg' },
          ogSiteName: 'YouTube'
        }
      });

      const res = await request(app)
        .get('/v/dQw4w9WgXcQ')
        .set('User-Agent', 'facebookexternalhit/1.1');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('Test Video');
      expect(ogs).toHaveBeenCalled();
    });

    it('should show metadata for Twitter bot', async () => {
      ogs.mockResolvedValue({
        error: false,
        result: {
          ogTitle: 'Twitter Test',
          ogDescription: 'Twitter Description',
          ogImage: { url: 'https://example.com/twitter.jpg' }
        }
      });

      const res = await request(app)
        .get('/v/test123456')
        .set('User-Agent', 'Twitterbot/1.0');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('Twitter Test');
    });

    it('should show metadata for Discord bot', async () => {
      ogs.mockResolvedValue({
        error: false,
        result: {
          ogTitle: 'Discord Test',
          ogDescription: 'Discord Description'
        }
      });

      const res = await request(app)
        .get('/v/test123456')
        .set('User-Agent', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('Discord Test');
    });

    it('should redirect regular Chrome user', async () => {
      const res = await request(app)
        .get('/v/test123456')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('dQw4w9WgXcQ');
    });
  });

  describe('GET /v/:videoId - Redirect Methods', () => {
    it('should use meta refresh when method=meta', async () => {
      const res = await request(app)
        .get('/v/test123456?method=meta')
        .set('User-Agent', 'Mozilla/5.0');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('meta http-equiv="refresh"');
      expect(res.text).toContain('dQw4w9WgXcQ&autoplay=1');
    });

    it('should use JavaScript redirect when method=js', async () => {
      const res = await request(app)
        .get('/v/test123456?method=js')
        .set('User-Agent', 'Mozilla/5.0');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('window.location.href=');
      expect(res.text).toContain('dQw4w9WgXcQ&autoplay=1');
    });

    it('should use standard redirect by default', async () => {
      const res = await request(app)
        .get('/v/test123456')
        .set('User-Agent', 'Mozilla/5.0');
      
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1');
    });
  });

  describe('GET /v/:videoId - Error Handling', () => {
    it('should handle OGS errors gracefully', async () => {
      // Mock OGS error
      ogs.mockRejectedValue(new Error('Network error'));
      
      // Mock alternative sources to also fail
      fetchFromAlternativeSources.mockRejectedValue(new Error('All sources failed'));

      const res = await request(app)
        .get('/v/test123456')
        .set('User-Agent', 'facebookexternalhit/1.1');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('YouTube Video'); // Fallback title
    });

    it('should try alternative sources when OGS fails', async () => {
      // Mock OGS failure
      ogs.mockRejectedValue(new Error('OGS failed'));
      
      // Mock alternative sources success
      fetchFromAlternativeSources.mockResolvedValue({
        ogTitle: 'Alternative Title',
        ogDescription: 'From alternative source',
        provider: 'oembed'
      });

      const res = await request(app)
        .get('/v/test123456')
        .set('User-Agent', 'facebookexternalhit/1.1');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('Alternative Title');
      expect(fetchFromAlternativeSources).toHaveBeenCalledWith('test123456');
    });

    it('should handle YouTube blocking (403 error)', async () => {
      // Mock 403 blocking error
      ogs.mockRejectedValue(new Error('403 Forbidden'));
      fetchFromAlternativeSources.mockRejectedValue(new Error('Blocked'));

      const res = await request(app)
        .get('/v/test123456')
        .set('User-Agent', 'facebookexternalhit/1.1');
      
      expect(res.status).toBe(200);
      expect(res.text).toBeTruthy(); // Should still return something
    });
  });

  describe('GET /v/test/:videoId/:mode - Test Endpoints', () => {
    it('should force spider behavior with mode=spider', async () => {
      const res = await request(app)
        .get('/v/test/dQw4w9WgXcQ/spider')
        .set('User-Agent', 'Mozilla/5.0'); // Regular browser
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('Rick Astley');
    });

    it('should force human behavior with mode=human', async () => {
      const res = await request(app)
        .get('/v/test/dQw4w9WgXcQ/human')
        .set('User-Agent', 'facebookexternalhit/1.1'); // Spider
      
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('dQw4w9WgXcQ');
    });

    it('should return error for invalid mode', async () => {
      const res = await request(app)
        .get('/v/test/dQw4w9WgXcQ/invalid');
      
      expect(res.status).toBe(200);
      expect(res.body.error).toBe('Invalid mode. Use "spider" or "human"');
    });
  });

  describe('GET /v/admin/cache-stats - Admin Endpoints', () => {
    it('should return cache statistics', async () => {
      const res = await request(app)
        .get('/v/admin/cache-stats');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('cache');
      expect(res.body).toHaveProperty('staticMetadataCount');
      expect(res.body.staticMetadataCount).toBeGreaterThan(0);
    });
  });
});