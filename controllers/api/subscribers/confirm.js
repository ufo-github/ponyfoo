'use strict';

var contra = require('contra');
var subscriberService = require('../../../services/subscriber');
var unfold = require('./lib/unfold');

function remove (req, res, next) {
  contra.waterfall([
    contra.curry(unfold, req, res),
    confirm
  ], respond);

  function confirm (email, next) {
    var topics = req.query.topic;
    if (typeof topics === 'string') { topics = [topics]; }
    if (Array.isArray(topics)) {
      subscriberService.confirmTopics(email, topics, next);
    } else {
      subscriberService.confirm(email, next);
    }
  }

  function respond (err, success) {
    if (err) {
      next(err); return;
    }
    if (success) {
      req.flash('success', 'Your subscription to our mailing list is confirmed!');
    } else {
      req.flash('error', 'Your confirmation request was invalid and couldn’t be fulfilled!');
    }
    res.redirect('/subscribe');
  }
}

module.exports = remove;
