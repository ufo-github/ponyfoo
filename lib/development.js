'use strict';

var winston = require('winston');
var env = require('./env');
var production = env('NODE_ENV') === 'production';
var api;

function statics (app) {
  var serveStatic = require('serve-static');
  app.use(serveStatic('.bin/public'));
  app.use('/img/uploads', serveStatic('uploads/images'));
}

function prettify (app) {
  var errorHandler = require('errorhandler');
  app.set('json spaces', 2);
  app.use(errorHandler());
  app.locals.pretty = true;
}

function patchExpress (app) {
  if (production) {
    return;
  }

  ['use', 'get', 'post', 'put', 'delete', 'patch'].forEach(function replace (key) {
    var original = app[key];

    app[key] = function through () {
      winston.debug('app.%s(%s)', key, readable(arguments));
      original.apply(this, arguments);
    };
  });

  function readable (args) {
    var limit = 60;
    return Array.prototype.slice.call(args).map(function text (arg) {
      var type = Object.prototype.toString.call(arg);
      if (type === '[object Function]') {
        return arg.name || 'fn';
      }
      if (type === '[object Number]') {
        return arg;
      }
      if (type === '[object Object]') {
        return JSON.stringify(arg).substr(0, limit);
      }
      if (arg && arg.toString) {
        return '\'' + arg.toString().substr(0, limit) + '\'';
      }
      return arg;
    }).join(', ');
  }
}

module.exports = api = function (app) {
  if (production) {
    return;
  }
  statics(app);
  prettify(app);
};

api.patchExpress = patchExpress;
