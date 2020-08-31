const express = require('express');
const router = express.Router();
const ogs = require('open-graph-scraper');

/* GET video page. */
router.get('/', async function(req, res, next) {
  const options = { 
	  url: "https://www.youtube.com/watch?v=" + req.params.videoId,
	  customMetaTags: [
		  { multiple: false, property: "fb:app_id", fieldName: "fbAppId" },
		  { multiple: false, property: "og:video:secure_url", fieldName: "ogVideoSecureUrl" },
		  { multiple: true,  property: "og:video:tag", fieldName: "ogVideoTag" }
		  ]
  }
  const { error, result, response } = await ogs(options);
  if (req.isSpider()) {
    res.render('video', {
      title: 'Video',
      result: result,
      layout: false
    });
  } else {
    res.redirect(302, "https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1")
  }
});

module.exports = router;
