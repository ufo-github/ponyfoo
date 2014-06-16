'use strict';

var winston = require('winston');
var env = require('./env');
var production = env('NODE_ENV') === 'production';
var rtext = /[ a-z]+/i;
var api;

function statics (app) {
  var serveStatic = require('serve-static');
  app.use(serveStatic('.bin/public'));
  app.use('/img/uploads', serveStatic('uploads/images'));
}

function prettify (app) {
  var errorHandler = require('errorhandler');
  var morgan = require('morgan');
  var stream = winston.createWriteStream('debug');

  app.use(morgan({
    format: ':status :method :url :response-time\\ms', // trick: '\\' allows to omit a space
    skip: skip,
    stream: stream
  }));
  app.set('json spaces', 2);
  app.use(errorHandler());
  app.locals.pretty = true;
}

function skip (req, res) {
  return res.statusCode === 304;
}

function patchExpress (app) {
  if (production) {
    return;
  }

  ['use', 'get', 'post', 'put', 'delete', 'patch'].forEach(function replace (key) {
    var original = app[key];

    app[key] = function through () {
      var args = Array.prototype.slice.call(arguments);
      var interesting = args.length !== 1 || typeof args[0] !== 'string' || !rtext.test(args[0]);
      if (interesting) {
        winston.debug('app.%s(%s)', key, readable(args));
      }
      return original.apply(this, args);
    };
  });

  function readable (args) {
    var limit = 60;
    return args.map(function text (arg) {
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
