'use strict';

var subscriberTwitterService = require('../../../services/subscriberTwitter');

function poll (req, res, next) {
  subscriberTwitterService.pollCards(polled);
  function polled (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = poll;
