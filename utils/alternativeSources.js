const https = require('https');
const logger = require('./logger');

// Alternative 1: Use YouTube's oEmbed API (usually not blocked)
async function fetchFromOEmbed(videoId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            ogTitle: json.title,
            ogDescription: `By ${json.author_name}`,
            ogImage: { url: json.thumbnail_url },
            ogSiteName: 'YouTube',
            provider: 'oembed'
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Alternative 2: Use Noembed (free, no API key required)
async function fetchFromNoembed(videoId) {
  return new Promise((resolve, reject) => {
    const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error));
          } else {
            resolve({
              ogTitle: json.title,
              ogDescription: `By ${json.author_name}`,
              ogImage: { url: json.thumbnail_url },
              ogSiteName: 'YouTube',
              provider: 'noembed'
            });
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Alternative 3: YouTube Data API (requires API key)
async function fetchFromYouTubeAPI(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }
  
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.items && json.items.length > 0) {
            const video = json.items[0].snippet;
            resolve({
              ogTitle: video.title,
              ogDescription: video.description.substring(0, 200),
              ogImage: { url: video.thumbnails.maxres?.url || video.thumbnails.high.url },
              ogSiteName: 'YouTube',
              provider: 'youtube-api'
            });
          } else {
            reject(new Error('Video not found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Try all sources in order
async function fetchFromAlternativeSources(videoId) {
  const sources = [
    { name: 'oEmbed', fn: () => fetchFromOEmbed(videoId) },
    { name: 'Noembed', fn: () => fetchFromNoembed(videoId) },
    { name: 'YouTube API', fn: () => fetchFromYouTubeAPI(videoId) }
  ];
  
  for (const source of sources) {
    try {
      logger.info(`Trying ${source.name} for ${videoId}`);
      const result = await source.fn();
      logger.info(`Success with ${source.name} for ${videoId}`);
      return result;
    } catch (error) {
      logger.warn(`${source.name} failed for ${videoId}: ${error.message}`);
    }
  }
  
  throw new Error('All alternative sources failed');
}

module.exports = {
  fetchFromOEmbed,
  fetchFromNoembed,
  fetchFromYouTubeAPI,
  fetchFromAlternativeSources
};