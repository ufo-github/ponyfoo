'use strict';

var util = require('util');
var taunus = require('taunus');

function PonyError (message, data) {
  Error.apply(this);
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.message = message;
  this.data = data;
}

function RequestError () {
  PonyError.apply(this, arguments);
  this.status = 400;
}

function NotFoundError () {
  PonyError.apply(this, arguments);
  this.message = 'Not Found';
  this.status = 404;
}

util.inherits(PonyError, Error);
util.inherits(RequestError, PonyError);
util.inherits(NotFoundError, RequestError);

function handler (err, req, res, next) {
  if (err instanceof RequestError) {
    render(err, req, res, next);
  } else {
    next(err);
  }
}

function render (err, req, res, next) {
  res.statusCode = err.status;
  res.partial = 'error/not-found';
  res.viewModel = {
    error: { message: err.message }
  };
  taunus.respond(req, res, next);
}

module.exports = {
  handler: handler,
  RequestError: RequestError,
  NotFoundError: NotFoundError
};
