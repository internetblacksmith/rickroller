# Anti-Blocking Guide for Rickroller

## Understanding YouTube Blocking

YouTube blocks scrapers based on:
1. **IP Address** - Too many requests from one IP
2. **User Agent** - Non-browser or repetitive agents
3. **Request Patterns** - Too fast, too regular
4. **Headers** - Missing or suspicious headers

## Implemented Solutions

### 1. **Proxy Rotation**
Configure proxies in environment variables:
```bash
PROXY_URL_1=http://proxy1.example.com:8080
PROXY_URL_2=http://proxy2.example.com:8080
PROXY_URL_3=http://proxy3.example.com:8080
```

Recommended proxy services:
- **ScraperAPI** - $29/month for 100k requests
- **Bright Data** - Pay as you go
- **ProxyMesh** - $10/month for rotating proxies
- **Smartproxy** - $75/month for 5GB

### 2. **Request Throttling**
- Minimum 2 seconds between requests
- Automatic backoff when blocked
- Exponential delay on retries

### 3. **Caching Strategy**
- 24-hour cache for successful fetches
- Static metadata for popular videos
- Memory cache to reduce requests

### 4. **Alternative Data Sources**
Priority order:
1. **Static Cache** - Pre-defined popular videos
2. **Memory Cache** - Recent successful fetches
3. **YouTube oEmbed** - Usually not rate-limited
4. **Noembed Service** - Free third-party service
5. **YouTube Data API** - Official API (requires key)
6. **Open Graph Scraper** - Direct scraping with protection
7. **Fallback Metadata** - Generic metadata

### 5. **User Agent Rotation**
Rotates through real browser user agents

### 6. **Headers Mimicking**
Sends all headers a real browser would send

## Setting Up YouTube API (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to environment:
```bash
YOUTUBE_API_KEY=your-api-key-here
```

Free quota: 10,000 units/day (enough for ~10,000 video requests)

## Monitoring for Blocks

Check logs for blocking indicators:
```bash
# Watch for blocking errors
tail -f logs/error.log | grep -E "429|403|BLOCKED"

# Check cache effectiveness
curl http://localhost:3000/v/admin/cache-stats
```

## Emergency Fallbacks

If everything is blocked:

1. **Use Static Metadata Only**
   - Add more videos to STATIC_METADATA in routes/video.js
   - Pre-scrape popular videos during off-peak hours

2. **Implement Client-Side Fetching**
   - Have the spider's browser fetch metadata
   - More complex but harder to block

3. **Use Multiple Server IPs**
   - Deploy to multiple cloud providers
   - Rotate between servers

## Best Practices

1. **Respect Rate Limits**
   - Don't make requests faster than every 2 seconds
   - Back off exponentially when blocked

2. **Cache Aggressively**
   - Cache for at least 24 hours
   - Pre-cache popular videos

3. **Monitor Your IPs**
   - Check if your IPs are blocked
   - Rotate IPs if needed

4. **Use the YouTube API**
   - It's free for small usage
   - Much more reliable than scraping

## Testing Blocking Protection

```bash
# Test with curl
curl -H "User-Agent: bot" http://localhost:3000/v/dQw4w9WgXcQ

# Check if caching works
curl http://localhost:3000/v/admin/cache-stats

# Monitor logs
tail -f logs/combined.log
```

## Deployment Tips

1. **Use Multiple Servers**
   - Deploy to Heroku, Vercel, Railway, etc.
   - Each gets different IP ranges

2. **Scheduled Cache Warming**
   - Pre-fetch popular videos during quiet hours
   - Reduces real-time scraping

3. **Geographic Distribution**
   - YouTube blocking can be region-specific
   - Use CDN or multi-region deployment