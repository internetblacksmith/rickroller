const rateLimit = require('express-rate-limit');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for video routes
const videoLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many video requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.isSpider && req.isSpider() // Skip rate limiting for bots
});

module.exports = {
  generalLimiter,
  videoLimiter
};