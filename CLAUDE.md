# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a rickrolling service that shows different content based on the visitor:
- **Bots/Crawlers**: See actual video metadata (for social media previews)
- **Human visitors**: Get redirected to Rick Astley's "Never Gonna Give You Up"

## Commands

- `npm start` - Start the application (runs on port 3000 by default, or PORT env variable)
- `npm run dev` - Start in development mode with auto-reload
- `npm test` - Run Jest tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `pm2 start ecosystem.config.js` - Start with PM2 (production)
- `docker-compose up -d` - Start with Docker

## Architecture Overview

### Core Functionality
1. **Main Application** (`app.js`): Express server with Pug templating, enhanced spider detection, rate limiting
2. **Spider Detection** (`middleware/spiderDetector.js`): Enhanced detection for 30+ bot patterns including social media crawlers
3. **Video Route** (`routes/video.js`): 
   - Validates YouTube video IDs (11 characters, alphanumeric + hyphen)
   - For spiders: Fetches metadata with multiple fallback sources
   - For humans: Redirects using HTTP 302, meta refresh, or JavaScript
   - Includes caching, throttling, and retry logic

### Anti-Blocking Features
1. **Multiple Data Sources** (in priority order):
   - Static metadata cache for popular videos
   - In-memory cache (24-hour TTL)
   - YouTube oEmbed API
   - Noembed service
   - YouTube Data API (requires key)
   - Open Graph Scraper with protections
   - Fallback metadata

2. **Protection Mechanisms**:
   - Request throttling (2s minimum between requests)
   - User-agent rotation
   - Proxy support
   - Exponential backoff on failures
   - Rate limiting per IP

### Monitoring & Debugging
- **Health Check** (`/health`): Monitor service and OGS status
- **Debug Routes** (`/debug/*`): Test spider detection and redirects
- **Cache Stats** (`/v/admin/cache-stats`): View cache performance
- **Test Page** (`/test.html`): Interactive debugging interface

## Key Files

- `app.js`: Main Express application
- `routes/video.js`: Core rickrolling logic with protections
- `middleware/spiderDetector.js`: Enhanced bot detection
- `utils/metadataCache.js`: Caching and throttling logic
- `utils/alternativeSources.js`: Fallback data sources
- `config/proxy.js`: Proxy rotation configuration
- `ecosystem.config.js`: PM2 cluster configuration
- `docker-compose.yml`: Docker deployment setup

## Environment Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# YouTube API (optional but recommended)
YOUTUBE_API_KEY=your-key-here

# Proxies (optional)
PROXY_URL_1=http://proxy1:8080
PROXY_URL_2=http://proxy2:8080

# Logging
LOG_LEVEL=info
```

## Testing

The project includes 250+ tests covering:
- Video route functionality
- Spider detection for various user agents
- Caching and throttling
- Error handling and fallbacks
- Integration tests

Run tests with: `npm test` or `npm run test:coverage`

## Common Issues & Solutions

1. **YouTube Blocking**: 
   - Configure proxies in environment
   - Use YouTube API key
   - Rely on alternative sources

2. **Redirect Not Working**:
   - Check `/debug/test/videoId` for detection info
   - Try `?method=meta` or `?method=js`
   - Test with `/debug/force-redirect/videoId`

3. **Performance Issues**:
   - Check cache stats at `/v/admin/cache-stats`
   - Ensure PM2 cluster mode is active
   - Monitor with `pm2 monit`

## Security Considerations

- All dependencies are updated and security vulnerabilities patched
- Rate limiting prevents abuse
- Input validation on all routes
- No sensitive data in logs
- Proxy URLs should be kept secure

## Recent Improvements (2025-01-25)

- Fixed 25 security vulnerabilities
- Migrated from Jade to Pug
- Added comprehensive anti-blocking strategies
- Enhanced spider detection for modern bots
- Added multiple redirect methods
- Implemented extensive test coverage
- Added Docker and PM2 deployment options
- Created detailed documentation