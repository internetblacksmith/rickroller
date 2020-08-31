const express = require('express');
const router = express.Router();
const ogs = require('open-graph-scraper');


/* GET home page. */
router.get('/',  function(req, res, next) {
  const options = { 
	  url: "https://www.youtube.com/watch?v=GZvSYJDk-us",
	  customMetaTags: [
		  { multiple: false, property: "al:android:app_name", fieldName: "al:android:app_name" },
		  { multiple: false, property: "al:android:package", fieldName: "al:android:package" },
		  { multiple: false, property: "al:android:url", fieldName: "al:android:url" },
		  { multiple: false, property: "al:ios:app_name", fieldName: "al:ios:app_name" },
		  { multiple: false, property: "al:ios:app_store_id", fieldName: "al:ios:app_store_id" },
		  { multiple: false, property: "al:ios:url", fieldName: "al:ios:url" },
		  { multiple: false, property: "al:web:url", fieldName: "al:web:url" },
		  { multiple: false, property: "fb:app_id", fieldName: "fb:app_id" },
		  { multiple: false, property: "og:description", fieldName: "og:description" },
		  { multiple: false, property: "og:image", fieldName: "og:image" },
		  { multiple: false, property: "og:image:height", fieldName: "og:image:height" },
		  { multiple: false, property: "og:image:width", fieldName: "og:image:width" },
		  { multiple: false, property: "og:site_name", fieldName: "og:site_name" },
		  { multiple: false, property: "og:title", fieldName: "og:title" },
		  { multiple: false, property: "og:type", fieldName: "og:type" },
		  { multiple: false, property: "og:url", fieldName: "og:url" },
		  { multiple: false, property: "og:video:height", fieldName: "og:video:height" },
		  { multiple: false, property: "og:video:secure_url", fieldName: "og:video:secure_url" },
		  { multiple: false, property: "og:video:type", fieldName: "og:video:type" },
		  { multiple: false, property: "og:video:url", fieldName: "og:video:url" },
		  { multiple: false, property: "og:video:width", fieldName: "og:video:width" },
		  { multiple: false, property: "twitter:app:id:googleplay", fieldName: "twitter:app:id:googleplay" },
		  { multiple: false, property: "twitter:app:id:ipad", fieldName: "twitter:app:id:ipad" },
		  { multiple: false, property: "twitter:app:id:iphone", fieldName: "twitter:app:id:iphone" },
		  { multiple: false, property: "twitter:app:name:googleplay", fieldName: "twitter:app:name:googleplay" },
		  { multiple: false, property: "twitter:app:name:ipad", fieldName: "twitter:app:name:ipad" },
		  { multiple: false, property: "twitter:app:name:iphone", fieldName: "twitter:app:name:iphone" },
		  { multiple: false, property: "twitter:app:url:googleplay", fieldName: "twitter:app:url:googleplay" },
		  { multiple: false, property: "twitter:app:url:ipad", fieldName: "twitter:app:url:ipad" },
		  { multiple: false, property: "twitter:app:url:iphone", fieldName: "twitter:app:url:iphone" },
		  { multiple: false, property: "twitter:card", fieldName: "twitter:card" },
		  { multiple: false, property: "twitter:description", fieldName: "twitter:description" },
		  { multiple: false, property: "twitter:image", fieldName: "twitter:image" },
		  { multiple: false, property: "twitter:player", fieldName: "twitter:player" },
		  { multiple: false, property: "twitter:player:height", fieldName: "twitter:player:height" },
		  { multiple: false, property: "twitter:player:width", fieldName: "twitter:player:width" },
		  { multiple: false, property: "twitter:site", fieldName: "twitter:site" },
		  { multiple: false, property: "twitter:title", fieldName: "twitter:title" },
		  { multiple: false, property: "twitter:url", fieldName: "twitter:url" },
		  { multiple: true,  property: "og:video:tag", fieldName: "og:video:tag" }]
  }
  ogs(options)
    .then((data) => {
      const { error, result, response } = data;
      console.log('result:', result); // This contains all of the Open Graph results
  })
  res.render('index', { title: 'Express' });
});

module.exports = router;
