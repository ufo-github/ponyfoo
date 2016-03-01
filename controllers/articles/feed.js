'use strict';

var path = require('path');
var articleFeedService = require('../../services/articleFeed');

module.exports = function (req, res) {
  if (articleFeedService.built) {
    send();
  } else {
    articleFeedService.once('built', send);
  }
  function send () {
    res.sendFile(articleFeedService.location);
  }
};
