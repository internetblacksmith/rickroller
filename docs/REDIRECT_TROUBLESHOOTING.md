# Redirect Troubleshooting Guide

## Common Redirect Issues and Solutions

### 1. **Spider Detection Failing**
If all users are being detected as spiders or no users are being detected as spiders:

**Debug endpoints:**
```bash
# Check what the server sees
curl http://localhost:3000/debug/test/dQw4w9WgXcQ

# Force redirect test
curl -L http://localhost:3000/debug/force-redirect/test

# Test spider detection
curl -H "User-Agent: facebookexternalhit/1.1" http://localhost:3000/debug/test/test
```

### 2. **Redirect Not Working in Browsers**

**Possible causes:**

#### A. Browser Extensions Blocking
- Ad blockers might prevent redirects
- Privacy extensions can block tracking parameters
- Solution: Test in incognito/private mode

#### B. HTTPS/HTTP Issues
- Modern browsers block redirects from HTTPS to HTTP
- Solution: Ensure your rickroll URL uses HTTPS

#### C. CSP Headers
- Content Security Policy might block redirects
- Check browser console for CSP errors

#### D. JavaScript Disabled
- Try the meta refresh method: `/v/videoId?method=meta`
- Or JavaScript method: `/v/videoId?method=js`

### 3. **Testing Different Redirect Methods**

```bash
# Method 1: Standard HTTP redirect (default)
curl -L http://localhost:3000/v/dQw4w9WgXcQ

# Method 2: Meta refresh
curl http://localhost:3000/v/dQw4w9WgXcQ?method=meta

# Method 3: JavaScript redirect
curl http://localhost:3000/v/dQw4w9WgXcQ?method=js

# Force human behavior
curl http://localhost:3000/v/test/dQw4w9WgXcQ/human

# Force spider behavior
curl http://localhost:3000/v/test/dQw4w9WgXcQ/spider
```

### 4. **Common User-Agent Issues**

Test with different user agents:

```bash
# Regular browser (should redirect)
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0" \
     -L http://localhost:3000/v/test

# Facebook (should show metadata)
curl -H "User-Agent: facebookexternalhit/1.1" \
     http://localhost:3000/v/test

# Twitter (should show metadata)
curl -H "User-Agent: Twitterbot/1.0" \
     http://localhost:3000/v/test

# Discord (should show metadata)
curl -H "User-Agent: Mozilla/5.0 (compatible; Discordbot/2.0)" \
     http://localhost:3000/v/test
```

### 5. **Check Logs**

```bash
# Watch real-time logs
tail -f logs/combined.log | grep -E "redirect|spider|human"

# Check for errors
tail -f logs/error.log
```

### 6. **Browser-Specific Issues**

#### Safari
- Might block third-party redirects
- Test with: `Safari > Preferences > Privacy > Prevent cross-site tracking` OFF

#### Chrome
- Check chrome://settings/content/popups
- Ensure redirects aren't blocked

#### Firefox
- Check about:config for `network.http.redirection-limit`
- Should be > 0

### 7. **Deployment Environment Issues**

#### Behind Proxy/CDN
- X-Forwarded headers might affect detection
- Add to your app:
```javascript
app.set('trust proxy', true);
```

#### Cloudflare
- Might cache redirects
- Add page rule to bypass cache for /v/*

#### CORS Issues
- If embedded in iframe, redirects might fail
- Add X-Frame-Options header

### 8. **Quick Fix Checklist**

1. ✅ Check spider detection: `/debug/test/videoId`
2. ✅ Test force redirect: `/debug/force-redirect/test`
3. ✅ Try different methods: `?method=meta` or `?method=js`
4. ✅ Check logs for errors
5. ✅ Test in incognito mode
6. ✅ Verify HTTPS on redirect URL
7. ✅ Clear browser cache
8. ✅ Check browser console for errors

### 9. **Nuclear Option**

If nothing works, create a simple HTML file that always redirects:

```javascript
// In routes/video.js, replace the redirect with:
res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Loading...</title>
    <meta http-equiv="refresh" content="0; url=${RICKROLL_URL}">
</head>
<body>
    <p>Loading video...</p>
    <script>
        // Backup redirect
        window.location.replace('${RICKROLL_URL}');
    </script>
    <noscript>
        <p>Please <a href="${RICKROLL_URL}">click here</a> to continue.</p>
    </noscript>
</body>
</html>
`);
```

This uses three redirect methods:
1. Meta refresh (works without JS)
2. JavaScript redirect (immediate)
3. Manual link (fallback)