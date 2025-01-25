const {
  getCachedMetadata,
  setCachedMetadata,
  canMakeRequest,
  waitForThrottle,
  getCacheStats
} = require('../utils/metadataCache');

describe('Metadata Cache Tests', () => {
  beforeEach(() => {
    // Clear cache before each test
    jest.resetModules();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve metadata', () => {
      const videoId = 'test123';
      const metadata = {
        ogTitle: 'Test Video',
        ogDescription: 'Test Description',
        ogImage: { url: 'https://example.com/image.jpg' }
      };

      setCachedMetadata(videoId, metadata);
      const retrieved = getCachedMetadata(videoId);

      expect(retrieved).toEqual(metadata);
    });

    it('should return undefined for non-existent keys', () => {
      const result = getCachedMetadata('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should overwrite existing metadata', () => {
      const videoId = 'test123';
      const metadata1 = { ogTitle: 'First Title' };
      const metadata2 = { ogTitle: 'Second Title' };

      setCachedMetadata(videoId, metadata1);
      setCachedMetadata(videoId, metadata2);

      const retrieved = getCachedMetadata(videoId);
      expect(retrieved.ogTitle).toBe('Second Title');
    });
  });

  describe('Request Throttling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle requests appropriately', () => {
      // First request should be allowed
      expect(canMakeRequest()).toBe(true);
      
      // Immediate second request should be blocked
      expect(canMakeRequest()).toBe(false);
      
      // After waiting 2+ seconds, should be allowed
      jest.advanceTimersByTime(2100);
      expect(canMakeRequest()).toBe(true);
    });

    it('should wait for throttle period', async () => {
      // Make first request
      canMakeRequest();
      
      // Start waiting for throttle
      const waitPromise = waitForThrottle();
      
      // Should be waiting
      expect(canMakeRequest()).toBe(false);
      
      // Advance time
      jest.advanceTimersByTime(2100);
      
      // Wait should complete
      await waitPromise;
      
      // Should be able to make request now
      expect(canMakeRequest()).toBe(true);
    });
  });

  describe('Cache Statistics', () => {
    it('should return cache statistics', () => {
      // Add some items to cache
      setCachedMetadata('video1', { ogTitle: 'Video 1' });
      setCachedMetadata('video2', { ogTitle: 'Video 2' });
      
      const stats = getCacheStats();
      
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('ksize');
      expect(stats).toHaveProperty('vsize');
      expect(stats.keys).toBeGreaterThanOrEqual(2);
    });
  });
});