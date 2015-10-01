'use strict';

var winston = require('winston');
var env = require('../../../lib/env');
var subscriberService = require('../../../services/subscriber');
var secret = env('TWITTER_LEAD_SECRET');

module.exports = function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  if (secret !== req.body.secret || !name || !email) {
    winston.warn('Unauthorized twitter lead generation endpoint access attempt');
    res.status(400).end();
    return;
  }
  subscriberService.add({
    email: email,
    name: name,
    source: 'twitter',
    verified: true
  }, added);

  function added (err, success, existed) {
    if (err) {
      res.status(500);
    } else if (existed) {
      res.status(204);
    } else if (success) {
      res.status(204);
    } else {
      res.status(400);
    }
    res.end();
  }
};
