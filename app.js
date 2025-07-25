const createError = require('http-errors');
const detector = require('spider-detector')
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const videoRouter = require('./routes/video');
const healthRouter = require('./routes/health');
const debugRouter = require('./routes/debug');
const shareRouter = require('./routes/share');
const apiRouter = require('./routes/api');
const { generalLimiter, videoLimiter } = require('./middleware/rateLimiter');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Only serve static files (including test.html) in development
if (app.get('env') === 'development') {
  app.use(express.static(path.join(__dirname, 'public')));
  // Rename test.html.dev back to test.html for development
  app.get('/test.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html.dev'));
  });
} else {
  // In production, only serve stylesheets
  app.use('/stylesheets', express.static(path.join(__dirname, 'public', 'stylesheets')));
  // Explicitly block test.html in production
  app.get('/test.html', (req, res) => {
    res.status(404).send('Not Found');
  });
}

// Use enhanced spider detection
const { enhancedSpiderDetector } = require('./middleware/spiderDetector');
app.use(enhancedSpiderDetector());

// Apply rate limiting
app.use(generalLimiter);

app.use('/', indexRouter);
app.use('/v', videoLimiter, videoRouter);
app.use('/health', healthRouter);
app.use('/share', shareRouter);
app.use('/api', apiRouter);
// Only enable debug routes in development
if (app.get('env') === 'development') {
  app.use('/debug', debugRouter);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
