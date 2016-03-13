'use strict';

var contra = require('contra');
var subscriberService = require('../../../services/subscriber');
var unfold = require('./lib/unfold');

function remove (req, res, next) {
  var topics = req.query.topic;
  if (typeof topics === 'string') { topics = [topics]; }

  contra.waterfall([
    contra.curry(unfold, req, res),
    confirm
  ], respond);

  function confirm (email, next) {
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
    if (req.query.returnTo) {
      res.redirect(req.query.returnTo);
    } else if (Array.isArray(topics)) {
      res.redirect('/subscribed' + topics.reduce(toKeyValue, ''));
    } else {
      res.redirect('/subscribed');
    }
  }
  function toKeyValue (query, topic, i) {
    var connector = i === 0 ? '?' : '&';
    return query + connector + topic;
  }
}

module.exports = remove;
