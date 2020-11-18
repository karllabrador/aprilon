const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const cron = require('node-cron');
const cards = require(path.join(__dirname, 'jobs', 'cards'));

const indexRouter = require('./routes/index');
const downloadRouter = require('./routes/download');

const app = express();

// generate cards once and then run every 5 minutes
cards.generate();
cron.schedule('*/5 * * * *', () => {
  cards.generate();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public', 'sass'),
  dest: path.join(__dirname, 'public', 'css'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: false,
  outputStyle: 'compressed',
  prefix: '/css'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/download', downloadRouter);

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
