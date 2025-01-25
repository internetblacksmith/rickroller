const detector = require('spider-detector');

// Custom spider detector with more comprehensive bot detection
const enhancedSpiderDetector = () => {
  return (req, res, next) => {
    // First use the default spider-detector
    detector.middleware()(req, res, () => {
      const userAgent = (req.get('user-agent') || '').toLowerCase();
      
      // Additional bot patterns that might be missed
      const additionalBotPatterns = [
        'facebookexternalhit',
        'facebookcatalog', 
        'twitterbot',
        'linkedinbot',
        'whatsapp',
        'telegram',
        'discord',
        'slack',
        'pinterest',
        'tumblr',
        'redditbot',
        'vkshare',
        'w3c_validator',
        'outbrain',
        'quora link preview',
        'qwantify',
        'bitrix link preview',
        'xing-contenttabreceiver',
        'chrome-lighthouse',
        'google-structured-data-testing-tool'
      ];
      
      // Check if any additional patterns match
      const isAdditionalBot = additionalBotPatterns.some(pattern => 
        userAgent.includes(pattern)
      );
      
      // Override or enhance the isSpider function
      const originalIsSpider = req.isSpider || (() => false);
      req.isSpider = () => {
        return originalIsSpider() || isAdditionalBot;
      };
      
      // Add debug info
      req.spiderInfo = {
        userAgent,
        detectedByOriginal: originalIsSpider(),
        detectedByAdditional: isAdditionalBot,
        finalResult: req.isSpider()
      };
      
      next();
    });
  };
};

module.exports = { enhancedSpiderDetector };