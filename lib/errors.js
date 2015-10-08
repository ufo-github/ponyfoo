'use strict';

var util = require('util');
var winston = require('winston');

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

function requestErrorHandler (err, req, res, next) {
  if (err instanceof NotFoundError) {
    res.redirect('/not-found');
  } else {
    winston.warn(err);
    next(err);
  }
}

module.exports = {
  handler: requestErrorHandler,
  RequestError: RequestError,
  NotFoundError: NotFoundError
};
