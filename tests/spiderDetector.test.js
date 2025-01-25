const request = require('supertest');
const express = require('express');
const { enhancedSpiderDetector } = require('../middleware/spiderDetector');

describe('Spider Detector Middleware Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(enhancedSpiderDetector());
    
    // Test endpoint that returns spider detection result
    app.get('/test', (req, res) => {
      res.json({
        isSpider: req.isSpider(),
        spiderInfo: req.spiderInfo,
        userAgent: req.get('user-agent')
      });
    });
  });

  describe('Bot Detection - Social Media Crawlers', () => {
    const socialMediaBots = [
      { name: 'Facebook', userAgent: 'facebookexternalhit/1.1' },
      { name: 'Facebook Catalog', userAgent: 'facebookcatalog/1.0' },
      { name: 'Twitter', userAgent: 'Twitterbot/1.0' },
      { name: 'LinkedIn', userAgent: 'LinkedInBot/1.0' },
      { name: 'WhatsApp', userAgent: 'WhatsApp/2.19.81 A' },
      { name: 'Telegram', userAgent: 'TelegramBot (like TwitterBot)' },
      { name: 'Discord', userAgent: 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)' },
      { name: 'Slack', userAgent: 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)' },
      { name: 'Pinterest', userAgent: 'Pinterest/0.2 (+https://www.pinterest.com/)' },
      { name: 'Tumblr', userAgent: 'Tumblr/14.0.0' },
      { name: 'Reddit', userAgent: 'redditbot/1.0' },
      { name: 'VK', userAgent: 'vkShare' },
      { name: 'Quora', userAgent: 'Quora Link Preview/1.0' }
    ];

    socialMediaBots.forEach(bot => {
      it(`should detect ${bot.name} bot`, async () => {
        const res = await request(app)
          .get('/test')
          .set('User-Agent', bot.userAgent);
        
        expect(res.body.isSpider).toBe(true);
        expect(res.body.spiderInfo.finalResult).toBe(true);
      });
    });
  });

  describe('Bot Detection - Search Engine Crawlers', () => {
    const searchEngineBots = [
      { name: 'Google', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
      { name: 'Bing', userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)' },
      { name: 'Yahoo', userAgent: 'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)' },
      { name: 'DuckDuckGo', userAgent: 'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)' },
      { name: 'Baidu', userAgent: 'Baiduspider+(+http://www.baidu.com/search/spider.htm)' },
      { name: 'Yandex', userAgent: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)' }
    ];

    searchEngineBots.forEach(bot => {
      it(`should detect ${bot.name} bot`, async () => {
        const res = await request(app)
          .get('/test')
          .set('User-Agent', bot.userAgent);
        
        expect(res.body.isSpider).toBe(true);
      });
    });
  });

  describe('Bot Detection - Development Tools', () => {
    const devTools = [
      { name: 'W3C Validator', userAgent: 'W3C_Validator/1.3' },
      { name: 'Chrome Lighthouse', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 Chrome-Lighthouse' },
      { name: 'Google Structured Data', userAgent: 'Mozilla/5.0 (compatible; Google-Structured-Data-Testing-Tool +https://search.google.com/structured-data/testing-tool)' }
    ];

    devTools.forEach(tool => {
      it(`should detect ${tool.name}`, async () => {
        const res = await request(app)
          .get('/test')
          .set('User-Agent', tool.userAgent);
        
        expect(res.body.isSpider).toBe(true);
      });
    });
  });

  describe('Human User Detection', () => {
    const humanUserAgents = [
      { name: 'Chrome Windows', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      { name: 'Firefox Mac', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0' },
      { name: 'Safari iOS', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1' },
      { name: 'Edge', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59' },
      { name: 'Android Chrome', userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36' }
    ];

    humanUserAgents.forEach(user => {
      it(`should NOT detect ${user.name} as spider`, async () => {
        const res = await request(app)
          .get('/test')
          .set('User-Agent', user.userAgent);
        
        expect(res.body.isSpider).toBe(false);
        expect(res.body.spiderInfo.finalResult).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user agent', async () => {
      const res = await request(app)
        .get('/test');
      
      expect(res.body.isSpider).toBe(false);
      expect(res.body.userAgent).toBeUndefined();
    });

    it('should handle empty user agent', async () => {
      const res = await request(app)
        .get('/test')
        .set('User-Agent', '');
      
      expect(res.body.isSpider).toBe(false);
    });

    it('should be case insensitive', async () => {
      const res = await request(app)
        .get('/test')
        .set('User-Agent', 'FACEBOOKEXTERNALHIT/1.1');
      
      expect(res.body.isSpider).toBe(true);
    });

    it('should detect bot in mixed user agent string', async () => {
      const res = await request(app)
        .get('/test')
        .set('User-Agent', 'Mozilla/5.0 (compatible; Test Browser) facebookexternalhit/1.1');
      
      expect(res.body.isSpider).toBe(true);
    });
  });

  describe('Spider Info Details', () => {
    it('should provide detailed spider info', async () => {
      const res = await request(app)
        .get('/test')
        .set('User-Agent', 'Twitterbot/1.0');
      
      expect(res.body.spiderInfo).toBeDefined();
      expect(res.body.spiderInfo.userAgent).toContain('twitterbot');
      expect(res.body.spiderInfo.finalResult).toBe(true);
      expect(res.body.spiderInfo).toHaveProperty('detectedByOriginal');
      expect(res.body.spiderInfo).toHaveProperty('detectedByAdditional');
    });
  });
});