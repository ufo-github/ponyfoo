'use strict';

process.chdir(__dirname);

var express = require('express');
var moment = require('moment');
var winston = require('winston');
var models = require('./models');
var logging = require('./lib/logging');
var env = require('./lib/env');
var db = require('./lib/db');
var middleware = require('./lib/middleware');
var routing = require('./controllers/routing');
var development = require('./lib/development');
var feedService = require('./services/feed');
var sitemapService = require('./services/sitemap');
var app = express();
var port = env('PORT');

logging.configure();
development.patch(app);

global.moment = moment;

app.locals.settings['x-powered-by'] = false;

db(operational);

function operational () {
  models();
  middleware(app);
  development.statics(app);
  routing(app);
  development.errors(app);
  app.listen(port, listening);
}

function listening () {
  winston.info('app listening on port %s', port);
  development.browserSync();
  feedService.rebuild();
  sitemapService.rebuild();
}
