const { withRetry } = require('../utils/retry');

describe('Retry Utility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Operations', () => {
    it('should return result on first success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const onRetry = jest.fn();
      
      const result = await withRetry(mockFn, { onRetry });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(onRetry).not.toHaveBeenCalled();
    });
  });

  describe('Retry Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      const onRetry = jest.fn();
      
      const promise = withRetry(mockFn, {
        maxRetries: 3,
        delay: 1000,
        onRetry
      });
      
      // Fast forward through retries
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff', async () => {
      const mockFn = jest.fn()
        .mockRejectedValue(new Error('Always fails'));
      
      const delays = [];
      const onRetry = jest.fn((attempt, error, waitTime) => {
        delays.push(waitTime);
      });
      
      const promise = withRetry(mockFn, {
        maxRetries: 3,
        delay: 100,
        backoff: 2,
        onRetry
      });
      
      jest.runAllTimers();
      
      try {
        await promise;
      } catch (e) {
        // Expected to fail
      }
      
      expect(delays).toEqual([100, 200, 400]); // 100, 100*2, 100*4
    });

    it('should throw last error after max retries', async () => {
      const error = new Error('Persistent failure');
      const mockFn = jest.fn().mockRejectedValue(error);
      
      const promise = withRetry(mockFn, {
        maxRetries: 2,
        delay: 100
      });
      
      jest.runAllTimers();
      
      await expect(promise).rejects.toThrow('Persistent failure');
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Configuration Options', () => {
    it('should use default options when not provided', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle zero retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      
      await expect(withRetry(mockFn, { maxRetries: 0 }))
        .rejects.toThrow('Fail');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry with correct parameters', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');
      
      const onRetry = jest.fn();
      
      jest.useFakeTimers();
      
      const promise = withRetry(mockFn, {
        maxRetries: 1,
        delay: 1000,
        onRetry
      });
      
      jest.runAllTimers();
      
      await promise;
      
      expect(onRetry).toHaveBeenCalledWith(1, error, 1000);
      
      jest.useRealTimers();
    });
  });
});