'use strict';

const contra = require('contra');
const winston = require('winston');
const weeklySharingService = require('./weeklySharing');
const WeeklyIssue = require('../models/WeeklyIssue');

function noop () {}

function share (issue, done) {
  if (done === void 0) {
    done = noop;
  }
  // for weekly newsletters, email broadcasting is done separately.
  contra.concurrent([
    medium('tweet', 'twitter'),
    medium('fb', 'facebook'),
    medium('echojs', 'echojs'),
    medium('hn', 'hackernews')
  ], done);

  function medium (key, method) {
    return function shareVia (next) {
      if (issue[key] === false) {
        winston.info('Sharing turned off via "%s" channel for weekly %s.', method, issue.computedName);
        next(); return;
      }
      winston.info('Sharing weekly %s via "%s" channel.', issue.computedName, method);
      weeklySharingService[method](issue, {}, next);
    };
  }
}

function emailPreview (email, done) {
  WeeklyIssue
    .findOne({ status: 'released', statusReach: 'everyone' })
    .sort('-publication')
    .exec(found);

  function found (err, issue) {
    if (err) {
      done(err); return;
    }
    if (!issue) {
      done(null); return;
    }
    weeklySharingService.email(issue, { recipients: [email] }, done);
  }
}

module.exports = {
  share: share,
  emailPreview: emailPreview
};
