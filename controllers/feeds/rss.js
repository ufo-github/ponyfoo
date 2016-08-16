'use strict';

const feedService = require(`../../services/feed`);
const maxAge = 15 * 60 * 1000; // 15 minutes

module.exports = function (req, res) {
  const id = req.params.id;
  if (!(id in feedService.feeds)) {
    res.end(``); return;
  }
  if (feedService.feeds[id].built) {
    send();
  } else {
    feedService.feeds[id].once(`built`, send);
  }
  function send () {
    res.sendFile(feedService.feeds[id].location, {
      maxAge: maxAge
    });
  }
};
