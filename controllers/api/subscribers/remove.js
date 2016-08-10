'use strict';

const contra = require('contra');
const subscriberService = require('../../../services/subscriber');
const unfold = require('./lib/unfold');
const topicTexts = {
  articles: 'emails about articles and comments',
  newsletter: 'our newsletter'
};

function remove (req, res, next) {
  const topic = req.query.topic;

  contra.waterfall([
    contra.curry(unfold, req, res),
    function (subscriber, next) {
      if (!subscriber) {
        next(null, false); return;
      }
      if (topic) {
        subscriberService.removeTopic(subscriber.email, topic, next);
      } else {
        subscriberService.remove(subscriber.email, next);
      }
    }
  ], respond);

  function respond (err, success, topic, hash) {
    if (err) {
      next(err); return;
    }
    const topicText = topic ? topicTexts[topic] || topic : 'our mailing list';
    if (success) {
      req.flash('success', 'You’ve successfully unsubscribed from ' + topicText + '!');
    } else {
      req.flash('error', 'Your unsubscription request was invalid and couldn’t be fulfilled!');
    }
    if (req.query.returnTo) {
      res.redirect(req.query.returnTo);
    } else if (topic && hash) {
      res.redirect('/unsubscribed?topic=' + topic + '&hash=' + hash);
    } else {
      res.redirect('/unsubscribed');
    }
  }
}

module.exports = remove;
