'use strict';

var util = require('util');
var renderer = require('../services/rendering_service');

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
  res.data = {
    partial: 'error/not-found',
    error: { message: err.message }
  };
  renderer.respond(req, res, next);
}

module.exports = {
  handler: handler,
  RequestError: RequestError,
  NotFoundError: NotFoundError
};
