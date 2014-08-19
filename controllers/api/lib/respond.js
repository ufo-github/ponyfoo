'use strict';

function factory (res, validation, next) {
  return function respond (err) {
    if (err) {
      if (validation.length) {
        invalid(res, validation);
      } else {
        next(err);
      }
    } else {
      res.json(200, validation.model);
    }
  };
}

function invalid (res, validation) {
  res.json(400, { messages: validation });
}

module.exports = factory;

factory.invalid = invalid;
