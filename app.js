var express = require('express');
var winston = require('winston');
var routing = require('./controllers/routing');
var db = require('./lib/db');
var app = express();
var port = process.env.PORT || 3000;

db(function () {
  routing(app);
  app.listen(port, listening);
});

function listening () {
  winston.info('app listening on port %s', port);
};
