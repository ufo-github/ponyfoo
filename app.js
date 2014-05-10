'use strict';

var express = require('express');
var winston = require('winston');
var routing = require('./controllers/routing');
var env = require('./lib/env');
var db = require('./lib/db');
var app = express();
var port = env('PORT');

db(function () {
  routing(app);
  app.listen(port, listening);
});

function listening () {
  winston.info('app listening on port %s', port);
};
