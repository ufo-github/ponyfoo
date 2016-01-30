'use strict';

var winston = require('winston');
var contra = require('contra');
var leads = require('twitter-leads');
var env = require('../../../lib/env');
var subscriberService = require('../../../services/subscriber');
var Subscriber = require('../../../models/Subscriber');

function remodel (req, res, next) {
  Subscriber.findOne({ source: 'twitter' }).sort('-created').exec(function found (err, last) {
    if (err) {
      next(err); return;
    }
    var since = last ? last.created : new Date(0);
    var options = {
      username: env('TWITTER_LEADS_USERNAME'),
      password: env('TWITTER_LEADS_PASSWORD'),
      ads: env('TWITTER_LEADS_ADS_ID'),
      card: env('TWITTER_LEADS_CARD_ID'),
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
