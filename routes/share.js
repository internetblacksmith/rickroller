const express = require('express');
const router = express.Router();

// Validate YouTube video ID (11 characters, alphanumeric plus dash/underscore)
function isValidVideoId(videoId) {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

// Show the share generator form
router.get('/', (req, res) => {
  res.render('share', { 
    title: 'Create Rickroll Link',
    error: null,
    success: null,
    videoId: '',
    shareUrl: ''
  });
});

// Handle form submission
router.post('/', async (req, res) => {
  const { videoId } = req.body;
  
  // Validate video ID
  if (!videoId || !isValidVideoId(videoId)) {
    return res.render('share', {
      title: 'Create Rickroll Link',
      error: 'Please enter a valid YouTube video ID (11 characters)',
      success: null,
      videoId: videoId || '',
      shareUrl: ''
    });
  }

  // Generate the full URL
  const protocol = req.protocol;
  const host = req.get('host');
  const shareUrl = `${protocol}://${host}/v/${videoId}`;
  
  // Facebook Sharing Debugger URL
  const facebookDebugUrl = `https://developers.facebook.com/tools/debug/sharing/?q=${encodeURIComponent(shareUrl)}`;
  
  res.render('share', {
    title: 'Create Rickroll Link',
    error: null,
    success: true,
    videoId: videoId,
    shareUrl: shareUrl,
    facebookDebugUrl: facebookDebugUrl
  });
});

module.exports = router;