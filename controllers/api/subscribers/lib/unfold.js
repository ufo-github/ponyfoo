'use strict';

var _ = require('lodash');
var contra = require('contra');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Subscriber = require('../../../../models/Subscriber');
var cryptoService = require('../../../../services/crypto');

function unfold (req, res, done) {
  var id = _.first(req.params.hash, 24);
  var email = _.rest(req.params.hash, 24);

  contra.waterfall([findExisting, validateThenRemove], done);

  function findExisting (next) {
    Subscriber.findOne({ _id: new ObjectId(id) }, next);
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
