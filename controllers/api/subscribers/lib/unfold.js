'use strict';

var contra = require('contra');
var Subscriber = require('../../../../models/Subscriber');
var cryptoService = require('../../../../services/crypto');

function unfold (req, res, done) {
  var hash = req.params.hash;
  var id = hash.substr(0, 24);
  var email = hash.substr(24);

  contra.waterfall([findExisting, validateThenRemove], done);

  function findExisting (next) {
    Subscriber.findOne({ _id: id }, next);
  }

  function validateThenRemove (subscriber, next) {
    if (!subscriber) {
      next(null, null); return;
    }
    if (cryptoService.md5(subscriber.email) !== email) {
      next(null, null); return;
    }
    next(null, subscriber.email);
  }
}

module.exports = unfold;
