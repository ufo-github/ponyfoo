'use strict';

var express = require('express');
var winston = require('winston');
var logging = require('./lib/logging');
var env = require('./lib/env');
var db = require('./lib/db');
var models = require('./models');
var middleware = require('./lib/middleware');
var routing = require('./controllers/routing');
var app = express();
var port = env('PORT');
var development = require('./lib/development');

logging.configure();
development.patch(app);

app.set('view engine', 'jade');
app.set('view options', {
  globals: ['moment']
});
app.locals.settings['x-powered-by'] = false;

db(function connected () {
  models();
  middleware(app);
  routing(app);
  development.middleware(app);
  app.listen(port, listening);
});

function listening () {
  winston.info('app listening on port %s', port);
  development.browserSync();
}
