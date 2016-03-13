'use strict';

var subscriberService = require('../../services/subscriber');

module.exports = function (req, res, next) {
  var allTopics = subscriberService.getTopics();
  var queryTopics = req.query.topic;
  if (typeof queryTopics === 'string') { queryTopics = [queryTopics]; }
  if (!Array.isArray(queryTopics)) { queryTopics = allTopics.slice(); }
  queryTopics.push('announcements');

  res.viewModel = {
    model: {
      title: 'Subscribed to Pony Foo!',
      topics: allTopics.slice().filter(byQuery)
    }
  };
  next();

  function byQuery (topic) {
    if (queryTopics) {
      if (Array.isArray(queryTopics)) {
        return queryTopics.indexOf(topic) !== -1
      }
      return queryTopics === topic || queryTopics
    }
    return true;
  }
};
