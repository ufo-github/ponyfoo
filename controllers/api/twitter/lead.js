'use strict';

const winston = require(`winston`);
const env = require(`../../../lib/env`);
const subscriberService = require(`../../../services/subscriber`);
const secret = env(`TWITTER_LEAD_SECRET`);

module.exports = function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  if (secret !== req.body.secret || !name || !email) {
    winston.warn(`Unauthorized twitter lead generation endpoint access attempt`);
    res.status(400).end();
    return;
  }
  subscriberService.add({
    email: email,
    name: name,
    source: `twitter`,
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
