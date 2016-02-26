'use strict';

var contra = require('contra');
var subscriberService = require('../../../services/subscriber');
var unfold = require('./lib/unfold');
var topicTexts = {
  articles: 'emails about articles and comments',
  newsletter: 'our newsletter'
};

function remove (req, res, next) {
  var topic = req.params.topic;

  contra.waterfall([
    contra.curry(unfold, req, res),
    function (email, next) {
      subscriberService.removeTopic(email, topic, next);
    }
  ], respond);

  function respond (err, success, topic, hash) {
    if (err) {
      next(err); return;
    }
    var topicText = topic ? topicTexts[topic] || topic : 'our mailing list';
    if (success) {
      req.flash('success', 'You’ve successfully unsubscribed from ' + topicText + '!');
    } else {
      req.flash('error', 'Your unsubscription request was invalid and couldn’t be fulfilled!');
    }
    if (topic) {
      res.redirect('/unsubscribed/' + topic + '?hash=' + hash);
    } else {
      res.redirect('/unsubscribed');
    }
  }
}

module.exports = remove;
