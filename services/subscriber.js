'use strict';

var util = require('util');
var contra = require('contra');
var emailService = require('./email');
var cryptoService = require('./crypto');
var Subscriber = require('../models/Subscriber');
var env = require('../lib/env');
var authority = env('AUTHORITY');

function add (email, done) {
  contra.waterfall([
    function findExisting (next) {
      Subscriber.findOne({ email: email }, next);
    },
    function bailOrCreate (existing, next) {
      if (existing) {
        next(); return;
      }
      var subscriber = new Subscriber({ email: email }).save(saved);

      function saved (err) {
        if (err) {
          next(err);
        } else {
          confirmation(subscriber, next);
        }
      }
    }
  ], done);
}

function confirmation (subscriber, done) {
  var hash = subscriber._id.toString() + cryptoService.md5(subscriber.email);
  var model = {
    to: subscriber.email,
    subject: 'Article feed subscription confirmation to Pony Foo',
    intro: 'Please confirm your email subscription!',
    confirm: util.format('%s/api/subscribers/%s/confirm', authority, hash),
    unsubscribe: util.format('%s/api/subscribers/%s/unsubscribe', authority, hash)
  };
  emailService.send('article-subscription', model, done);
}

function confirm (email, done) {
  Subscriber.update({ email: email }, { verified: true }, successback(done));
}

function remove (email, done) {
  Subscriber.remove({ email: email }, successback(done));
}

function successback (done) {
  return function (err) {
    done(err, !err);
  };
}

module.exports = {
  add: add,
  remove: remove,
  confirm: confirm
};
