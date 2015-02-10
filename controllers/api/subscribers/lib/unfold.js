'use strict';

var _ = require('lodash');
var contra = require('contra');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
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
      next(); return;
    }
    if (cryptoService.md5(subscriber.email) !== email) {
      next(); return;
    }
    next(null, subscriber.email);
  }
}

module.exports = unfold;
