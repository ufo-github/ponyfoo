'use strict';

function respond (err, res, next, validation, valid) {
  if (err) {
    if (validation.length) {
      invalid(res, validation);
    } else {
      next(err);
    }
  } else {
    res.json(valid || {});
  }
}

function invalid (res, validation) {
  res.status(400).json({ messages: validation });
}

module.exports = respond;

respond.invalid = invalid;
