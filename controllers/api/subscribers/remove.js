'use strict';

var contra = require('contra');
var subscriberService = require('../../../services/subscriber');
var unfold = require('./lib/unfold');

function remove (req, res, next) {
  contra.waterfall([
    contra.curry(unfold, req, res),
    subscriberService.remove
  ], respond);

  function respond (err, success) {
    if (err) {
      next(err); return;
    }
    if (success) {
      req.flash('success', 'You\'ve unsubscribed from our mailing list successfully!');
    } else {
      req.flash('error', 'Your unsubscription request was invalid and couldn\'t be fulfilled!');
    }
    res.redirect('/');
  }
}

module.exports = remove;
