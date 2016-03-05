'use strict';

var feedService = require('../../services/feed');

module.exports = function (req, res) {
  var id = req.params.id;
  if (!(id in feedService.feeds)) {
    res.end(''); return;
  }
  if (feedService.feeds[id].built) {
    send();
  } else {
    feedService.feeds[id].once('built', send);
  }
  function send () {
    res.sendFile(feedService.feeds[id].location);
  }
};
