'use strict';

const feedService = require(`../../services/feed`);
const maxAge = 1000 * 60 * 15; // 15 minutes

module.exports = function (req, res) {
  const id = req.params.id;
  const feed = feedService.feeds.get(id);
  if (!feed) {
    res.end(``); return;
  }
  if (feed.built) {
    send();
  } else {
    feed.once(`built`, send);
  }
  function send () {
    res.sendFile(feed.location, { maxAge });
  }
};
