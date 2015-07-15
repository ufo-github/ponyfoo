'use strict';

require('./chdir');

var express = require('express');
var moment = require('moment');
var winston = require('winston');
var models = require('./models');
var pkg = require('./package.json');
var logging = require('./lib/logging');
var env = require('./lib/env');
var db = require('./lib/db');
var middleware = require('./lib/middleware');
var routing = require('./controllers/routing');
var development = require('./lib/development');
var feedService = require('./services/feed');
var sitemapService = require('./services/sitemap');
var articleSearchService = require('./services/articleSearch');
var shouldRebuild = !env('APP_REBUILD');
var port = env('PORT');

function listen () {
  var app = express();

  logging.configure();
  development.patch(app);

  global.moment = moment;

  app.locals.settings['x-powered-by'] = false;

  db(operational);

  function operational () {
    winston.info('Worker %s executing app@%s', process.pid, pkg.version);
    process.on('uncaughtException', fatal);
    models();
    middleware(app);
    development.statics(app);
    routing(app);
    development.errors(app);
    app.listen(port, listening);
  }
}

function listening () {
  winston.info('app listening on port %s', port);
  development.browserSync();

  if (shouldRebuild) {
    setTimeout(rebuild, random(1000, 5000));
  }
}

function rebuild () {
  feedService.rebuild();
  sitemapService.rebuild();
  articleSearchService.rebuild();
}

function fatal (err) {
  winston.error('Uncaught exception', { error: err, stack: err.stack || '(none)' }, exit);
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
