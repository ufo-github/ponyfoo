'use strict';

const winston = require('winston');
const passport = require('passport');
const env = require('./env');
const patch = require('./patch');
const port = env('PORT');
const productionGrade = !env('DEV') && env('NODE_ENV') !== 'development';
const debugExpress = env('LOG_DEBUG_EXPRESS');
const rtext = /[ a-z]+/i;
const proxyPort = parseInt(port) + 100;

function statics (app) {
  if (productionGrade) {
    return;
  }
  const serveFavicon = require('serve-favicon');
  const serveStatic = require('serve-static');
  app.use(serveFavicon('.bin/public/favicon.ico'));
  app.use(serveStatic('.bin/public'));
  app.use('/img/uploads', serveStatic('tmp/images'));
}

function logging (app) {
  const morgan = require('morgan');
  const stream = winston.createWriteStream('debug');
  const fmt = ':status :method :url :response-time\\ms'; // trick: '\’ allows to omit a space

  app.use(morgan(fmt, {
    skip: skip,
    stream: stream
  }));
}

function sync () {
  if (productionGrade) {
    return;
  }
  const browserSync = require('browser-sync');
  const config = {
    open: false,
    notify: false,
    logLevel: 'silent',
    proxy: 'localhost:' + port,
    port: proxyPort,
    files: ['.bin/**/*.js', '.bin/**/*.css']
  };
  browserSync(config, syncUp);
}

function syncUp () {
  winston.info('browser-sync proxying app on port %s', proxyPort);
}

function errors (app) {
  if (productionGrade) {
    return;
  }
  const errorHandler = require('errorhandler');
  app.use(errorHandler());
}

function skip (req, res) {
  return res.statusCode === 304;
}

function patchThings (app) {
  if (productionGrade) {
    return;
  }
  logging(app);
  app.set('json spaces', 2);
  app.locals.pretty = true;
  if (debugExpress === false) {
    return;
  }
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

module.exports = {
  patch: patchThings,
  statics: statics,
  errors: errors,
  browserSync: sync
};
