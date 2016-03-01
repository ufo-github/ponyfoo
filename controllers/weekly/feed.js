'use strict';

var path = require('path');
var weeklyFeedService = require('../../services/weeklyFeed');

module.exports = function (req, res) {
  if (weeklyFeedService.built) {
    send();
  } else {
    weeklyFeedService.once('built', send);
  }
  function send () {
    res.sendFile(weeklyFeedService.location);
  }
};
