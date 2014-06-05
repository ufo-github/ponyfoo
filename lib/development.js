'use strict';

var env = require('./env');
var production = env('NODE_ENV') === 'production';

module.exports = function (app) {
  if (production) {
    return;
  }
  statics(app);
  prettify(app);
};

function statics (app) {
  var serveStatic = require('serve-static');
  app.use(serveStatic('.bin/public'));
}

function prettify (app) {
  var errorHandler = require('errorhandler');
  app.set('json spaces', 2);
  app.use(errorHandler());
  app.locals.pretty = true;
}
