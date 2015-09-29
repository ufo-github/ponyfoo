'use strict';

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
var env = require('./lib/env');
var db = require('./lib/db');
var middleware = require('./lib/middleware');
var routing = require('./controllers/routing');
var development = require('./lib/development');
var feedService = require('./services/feed');
var sitemapService = require('./services/sitemap');
var shouldRebuild = !env('APP_REBUILD');
var port = env('PORT');

function listen () {
  var app = express();
  var server = http.createServer(app);

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
    lipstick.listen(server, port, listening);
  }
}

function listening () {
  winston.info('app listening on http://%s:%s', os.hostname(), port);
  development.browserSync();

  require('./models/Article').find({}, function (err, articles) {
    require('contra').each.series(articles, function (article, next) {
      if (article.introduction) {
        console.log('Skipping "%s"', article.title)
        next(); return;
      }
      var h = require('cheerio').load(article.teaserHtml)
      var p = h('p').first()
      var tease = require('domador')(p.html())
      p.remove()
      var rest = require('domador')(h.html())
      article.teaser = tease
      article.introduction = rest
      console.log('Updating "%s"', article.title)
      article.save(require('but')(next))
    })
  })
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
