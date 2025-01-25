// Suppress console logs during tests unless debugging
if (process.env.NODE_ENV !== 'debug') {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';