'use strict';

var winston = require('winston');
var contra = require('contra');
var leads = require('twitter-leads');
var subscriberService = require('./subscriber');
var Subscriber = require('../models/Subscriber');
var env = require('../lib/env');
var username = env('TWITTER_LEADS_USERNAME');
var password = env('TWITTER_LEADS_PASSWORD');
var ads = env('TWITTER_LEADS_ADS_ID');
var articles = env('TWITTER_LEADS_CARD_ID_ARTICLES');
var newsletter = env('TWITTER_LEADS_CARD_ID_NEWSLETTER');

function pollCards (done) {
  if (!username || !password || !ads || (!articles && !newsletter)) {
    done(new Error('Method not implemented.')); return;
    return;
  }

  var tasks = [];
  if (articles) {
    tasks.push(makeTask('', articles));
  }
  if (newsletter) {
    tasks.push(makeTask('+newsletter', newsletter));
  }
  contra.concurrent(tasks, done);

  function makeTask (key, id) {
    return function pull (next) {
      Subscriber
        .findOne({ source: 'twitter' + key })
        .sort('-created')
        .exec(found);
      function found (err, last) {
        if (err) {
          next(err); return;
        }
        var since = last ? last.created : new Date(0);
        var options = {
          username: username,
          password: password,
          ads: ads,
          card: id,
          since: since
        };
        leads(options, pulled);
      }
      function pulled (err, leads) {
        if (err) {
          next(err); return;
        }
        if (leads.length) {
          winston.info('Found %s lead%s via Twitter Cards %s', leads.length, leads.length === 1 ? '' : 's', key || '+articles');
        } else {
          winston.debug('No new leads via Twitter Cards %s', key || '+articles');
        }
        contra.each(leads, 3, follow, next);
      }
      function follow (lead, next) {
        subscriberService.add({
          created: lead.time,
          email: lead.email,
          name: lead.name,
          source: 'twitter' + key,
          verified: true
        }, next);
      }
    };
  }
}

module.exports = {
  pollCards: pollCards
};
