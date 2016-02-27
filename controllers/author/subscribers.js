'use strict';

var contra = require('contra');
var pullData = require('../lib/pullData');
var Subscriber = require('../../models/Subscriber');
var subscriberService = require('../../services/subscriber');
var datetimeService = require('../../services/datetime');

module.exports = function (req, res, next) {
  var max = 100;
  var page = parseInt(req.params.page, 10) || 1;
  var p = page - 1;
  var start = max * p;

  contra.concurrent({
    subscriberGraph: pullData,
    subscribers: pullSubscribers
  }, ready);

  function pullSubscribers (next) {
    Subscriber
      .find({})
      .sort('-created')
      .skip(p * max)
      .limit(max)
      .lean()
      .exec(found);
    function found (err, subscribers) {
      if (err) {
        next(err); return;
      }
      next(null, subscribers.map(toModel));
    }
  }

  function toModel (subscriber) {
    return {
      created: datetimeService.field(subscriber.created),
      email: subscriber.email,
      topics: subscriber.topics,
      source: subscriber.source,
      verified: subscriber.verified,
      hash: subscriberService.getHash(subscriber)
    };
  }

  function ready (err, result) {
    if (err) {
      next(err); return;
    }

    res.viewModel = {
      model: {
        title: 'Subscribers \u2014 Pony Foo',
        subscriberGraph: result.subscriberGraph,
        subscribers: result.subscribers,
        allTopics: subscriberService.getTopics(),
        more: result.subscribers.length >= max,
        page: page
      }
    };
    next();
  }
};
