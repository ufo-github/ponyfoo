'use strict';

process.chdir(__dirname);

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
var app = express();
var port = env('PORT');
var rebuild = !env('APP_REBUILD');

logging.configure();
development.patch(app);

global.moment = moment;

app.locals.settings['x-powered-by'] = false;

db(operational);

function operational () {
  winston.info('Worker %s executing app@%s', process.pid, pkg.version);
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

  if (rebuild) {
    feedService.rebuild();
    sitemapService.rebuild();
    articleSearchService.rebuild();
  }
}
