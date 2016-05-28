'use strict';

var env = require('./lib/env');

require('./preconfigure');
require('./chdir');

var os = require('os');
var http = require('http');
var express = require('express');
var moment = require('moment');
var winston = require('winston');
var lipstick = require('lipstick');
var models = require('./models');
var pkg = require('./package.json');
var logging = require('./lib/logging');
var db = require('./lib/db');
var elasticsearch = require('./lib/elasticsearch');
var middleware = require('./lib/middleware');
var routing = require('./controllers/routing');
var development = require('./lib/development');
var articleFeedService = require('./services/articleFeed');
var weeklyFeedService = require('./services/weeklyFeed');
var sitemapService = require('./services/sitemap');
var shouldRebuild = !env('APP_REBUILD');
var port = env('PORT');

require('./services/fullFeed'); // listens for events and auto-rebuilds.

function listen () {
  var app = express();
  var server = http.createServer(app);

  development.patch(app);

  global.moment = moment;

  app.locals.settings['x-powered-by'] = false;

  db(dbOperational);

  function dbOperational () {
    logging.configure();
    winston.info('Worker %s executing app@%s', process.pid, pkg.version);
    process.on('uncaughtException', fatal);
    models();
    elasticsearch();
    middleware(app);
    development.statics(app);
    routing(app);
    development.errors(app);
    lipstick.listen(server, port, listening);
  }
}

function listening () {
  winston.info('app listening on %s:%s', os.hostname(), port);
  development.browserSync();

  if (shouldRebuild) {
    setTimeout(rebuild, random(1000, 5000));
  }
}

function rebuild () {
  articleFeedService.rebuild();
  weeklyFeedService.rebuild();
  sitemapService.rebuild();
}

function fatal (err) {
  winston.error('Uncaught exception', { stack: err.stack || err.message || err || '(unknown)' }, exit);
}

function exit () {
  process.exit(1);
}

function random (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

if (module.parent) {
  module.exports = listen;
} else {
  listen();
}
