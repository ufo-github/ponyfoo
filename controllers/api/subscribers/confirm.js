'use strict';

var _ = require('lodash');
var contra = require('contra');
var subscriberService = require('../../../services/subscriber');
var unfold = require('./lib/unfold');

function remove (req, res, next) {
  contra.waterfall([
    contra.curry(unfold, req, res),
    subscriberService.confirm
  ], respond);

  function respond (err, success) {
    if (err) {
      next(err); return;
    }
    if (success) {
      req.flash('success', 'Your subscription to our mailing list is confirmed!');
    } else {
      req.flash('error', 'Your confirmation request was invalid and couldn\'t be fulfilled!');
    }
    res.redirect('/');
  }
}

module.exports = remove;
