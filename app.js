'use strict';

var express = require('express');
var winston = require('winston');
var env = require('./lib/env');
var db = require('./lib/db');
var middleware = require('./lib/middleware');
var routing = require('./controllers/routing');
var app = express();
var port = env('PORT');
var devenv = env('NODE_ENV') === 'development';

function noop () {}
function dev (fn) { (devenv ? fn : noop)(); }

app.set('view engine', 'jade');
app.locals.settings['x-powered-by'] = false;

dev(statics);
db(function connected () {
  middleware(app);
  routing(app);
  dev(prettify);
  app.listen(port, listening);
});

function listening () {
  winston.info('app listening on port %s', port);
}

function statics () {
  var serveStatic = require('serve-static');
  app.use(serveStatic('.bin/public'));
}

function prettify () {
  var errorHandler = require('errorhandler');
  app.set('json spaces', 2);
  app.use(errorHandler());
  app.locals.pretty = true;
}
