'use strict';

function respond (err, res, next, validation) {
  if (err) {
    if (validation.length) {
      invalid(res, validation);
    } else {
      next(err);
    }
  } else {
    res.json(200, {});
  }
}

function invalid (res, validation) {
  res.json(400, { messages: validation });
}

module.exports = respond;

respond.invalid = invalid;
