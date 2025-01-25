const request = require('supertest');
const express = require('express');

// Mock dependencies
jest.mock('open-graph-scraper');
const ogs = require('open-graph-scraper');

describe('Health Route Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    const healthRouter = require('../routes/health');
    app.use('/health', healthRouter);
  });

  describe('GET /health', () => {
    it('should return healthy status when OGS works', async () => {
      // Mock successful OGS response
      ogs.mockResolvedValue({ error: false });

      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeGreaterThan(0);
      expect(res.body.environment).toBeDefined();
      expect(res.body.services.openGraphScraper).toBe('healthy');
    });

    it('should return degraded status when OGS fails', async () => {
      // Mock OGS failure
      ogs.mockResolvedValue({ error: 'Connection failed' });

      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.services.openGraphScraper).toBe('degraded');
    });

    it('should return 503 on unexpected error', async () => {
      // Mock OGS throwing an error
      ogs.mockRejectedValue(new Error('Unexpected error'));

      const res = await request(app).get('/health');

      expect(res.status).toBe(503);
      expect(res.body.status).toBe('error');
      expect(res.body.error).toBe('Unexpected error');
    });

    it('should include proper timestamp format', async () => {
      ogs.mockResolvedValue({ error: false });

      const res = await request(app).get('/health');
      
      // Check if timestamp is valid ISO string
      const timestamp = new Date(res.body.timestamp);
      expect(timestamp.toISOString()).toBe(res.body.timestamp);
    });
  });
});