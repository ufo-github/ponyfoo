'use strict';

var winston = require('winston');
var passport = require('passport');
var env = require('./env');
var patch = require('./patch');
var production = env('NODE_ENV') === 'production';
var rtext = /[ a-z]+/i;
var api;

function statics (app) {
  var serveFavicon = require('serve-favicon');
  var serveStatic = require('serve-static');
  app.use(serveFavicon('.bin/public/favicon.ico'));
  app.use(serveStatic('.bin/public'));
  app.use('/img/uploads', serveStatic('uploads/images'));
}

function logging (app) {
  var morgan = require('morgan');
  var stream = winston.createWriteStream('debug');
  app.use(morgan({
    format: ':status :method :url :response-time\\ms', // trick: '\\' allows to omit a space
    skip: skip,
    stream: stream
  }));
}

function sync () {
  if (production) {
    return;
  }
  var browserSync = require('browser-sync');
  var config = {
    open: false,
    logLevel: 'silent',
    proxy: 'localhost:' + env('PORT'),
    files: ['.bin/**/*.js', '.bin/**/*.css']
  };
  browserSync(config, syncUp);
}

function syncUp () {
  winston.info('browser-sync proxying app on port %s', this.options.port);
}

function errors (app) {
  var errorHandler = require('errorhandler');
  app.use(errorHandler());
}

function skip (req, res) {
  return res.statusCode === 304;
}

function patchThings (app) {
  if (production) {
    return;
  }
  logging(app);

  app.set('json spaces', 2);
  app.locals.pretty = true;

  patchPassport();
  patchExpress(app);
}

function patchExpress (app) {
  patch(app, 'app', ['use', 'get', 'post', 'put', 'delete', 'patch'], filter);

  function filter (key, args) {
    return args.length !== 1 || typeof args[0] !== 'string' || !rtext.test(args[0]);
  }
}

function patchPassport () {
  patch(passport, 'passport', ['use']);
}

function middleware (app) {
  if (production) {
    return;
  }
  statics(app);
  errors(app);
}

module.exports = {
  patch: patchThings,
  middleware: middleware,
  browserSync: sync
};
