'use strict';

var moment = require('moment');
var google = require('googleapis');
var env = require('../../lib/env');
var email = env('GA_EMAIL');
var privateKey = env('GA_PRIVATE_KEY');
var profile = env('GA_PROFILE');
var analyticsScope = 'https://www.googleapis.com/auth/analytics.readonly';

function pullPageViews (done) {
  if (!email || !privateKey || !profile) {
    done(null, []); return;
  }
  var jwt = new google.auth.JWT(
    email,
    null,
    privateKey,
    [analyticsScope],
    null
  );
  jwt.authorize(authorized);
  function authorized (err) {
    if (err) {
      done(err); return;
    }
    var query = {
      auth: jwt,
      ids: 'ga:' + profile,
      'start-date': '2012-12-25',
      'end-date': 'today',
      'max-results': 10000,
      metrics: 'ga:pageviews',
      dimensions: 'ga:date',
      sort: 'ga:date'
    };
    google.analytics('v3').data.ga.get(query, got);
  }
  function got (err, result) {
    if (err) {
      done(err); return;
    }
    done(null, result.rows.map(toDailyPageView));
  }
}

function toDailyPageView (item) {
  return {
    date: moment(item[0], 'YYYYMMDD').toDate(),
    views: parseInt(item[1])
  };
}

module.exports = pullPageViews;
