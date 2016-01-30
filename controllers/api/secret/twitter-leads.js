'use strict';

var winston = require('winston');
var contra = require('contra');
var leads = require('twitter-leads');
var env = require('../../../lib/env');
var subscriberService = require('../../../services/subscriber');
var Subscriber = require('../../../models/Subscriber');
var username = env('TWITTER_LEADS_USERNAME');
var password = env('TWITTER_LEADS_PASSWORD');
var ads = env('TWITTER_LEADS_ADS_ID');
var card = env('TWITTER_LEADS_CARD_ID');

function remodel (req, res, next) {
  if (!username || !password || !ads || !card) {
    res.status(500).json({ error: 500, message: 'Method not implemented.' });
    return;
  }
  Subscriber.findOne({ source: 'twitter' }).sort('-created').exec(function found (err, last) {
    if (err) {
      next(err); return;
    }
    var since = last ? last.created : new Date(0);
    var options = {
      username: username,
      password: password,
      ads: ads,
      card: card,
      since: since
    };
    leads(options, found);
    function found (err, leads) {
      if (err) {
        next(err); return;
      }
      if (leads.length) {
        winston.info('Found %s leads via Twitter Cards', leads.length);
      } else {
        winston.debug('No new leads via Twitter Cards');
      }
      contra.each(leads, 3, follow, done);
      function follow (lead, next) {
        subscriberService.add({
          created: lead.time,
          email: lead.email,
          name: lead.name,
          source: 'twitter',
          verified: true
        }, next);
      }
    }
    function done (err) {
      if (err) {
        next(er); return;
      }
      res.json({});
    }
  });
}

module.exports = remodel;
