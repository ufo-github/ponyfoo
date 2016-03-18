'use strict';

var moment = require('moment');
var winston = require('winston');
var correcthorse = require('correcthorse');
var WeeklyIssue = require('../models/WeeklyIssue');
var weeklyFeedService = require('./weeklyFeed');
var weeklySharingService = require('./weeklySharing');
var settingService = require('./setting');

/*
 * [A] Find an issue that's released to patrons? Verify publication, update RSS feed & release to everyone else.
 * [B] Find an issue that's scheduled for release? Verify publication, release to patrons.
 * [C] Find an issue that's ready for release?
 *   [D] If next thursday is in 3 days or less: schedule & go back to [B].
 *   [E] Else do nothing
 * [F] Do nothing
 */
function run (done) {
  var levels = ['debug', 'info'];
  var level = 'debug';
  settingService.getKey('PONYFOOWEEKLY_CRON_LEVEL', got);
  function got (err, value) {
    if (err) {
      started(); end(err); return;
    }
    if (levels.indexOf(value) !== -1) {
      level = value;
    }
    started();
    findReleasedToPatrons();
  }
  function started () {
    winston[level]('Weekly scheduler job run started.');
  }
  function findReleasedToPatrons () {
    WeeklyIssue
      .findOne({ status: 'released', statusReach: 'patrons' })
      .sort([['publication', -1], ['updated', -1]])
      .exec(foundReleasedToPatrons);
  }
  function foundReleasedToPatrons (err, issue) {
    if (err) {
      end(err); return;
    }
    if (!issue) {
      winston[level]('No weeklies marked as "released+patrons".');
      findScheduledOrReady();
      return;
    }
    if (moment().isBefore(moment(issue.publication))) {
      winston[level]('Found weekly "%s" in "patrons" status. Not ready for "everyone" yet.', issue.slug);
      end();
      return;
    }
    releaseToEveryoneElse(issue);
  }
  function findScheduledOrReady () {
    WeeklyIssue
      .findOne({ status: 'ready' })
      .sort([['publication', -1], ['updated', -1]])
      .exec(foundScheduledOrReady);
  }
  function foundScheduledOrReady (err, issue) {
    if (err) {
      end(err); return;
    }
    if (!issue) {
      winston[level]('No weeklies marked as "ready".');
      end();
      return;
    }
    if (issue.publication) {
      if (moment().isBefore(moment(issue.publication).subtract(1, 'days'))) {
        winston[level]('Found weekly "%s" in "ready" status. Not ready for "patrons" yet!', issue.slug);
        end();
        return;
      }
      releaseToPatrons(issue);
    } else {
      attemptToSetPublicationDate(issue);
    }
  }
  function attemptToSetPublicationDate (issue) {
    var target = getPublicationTarget(issue);
    if (target === null) {
      end();
      return;
    }
    WeeklyIssue
      .findOne({})
      .sort('-issue')
      .exec(foundLatestIssue);
    function foundLatestIssue (err, latestIssue) {
      if (err) {
        end(err); return;
      }
      var latest = latestIssue && latestIssue.issue || 0;
      var number = latest + 1;
      issue.statusReach = 'scheduled';
      issue.publication = target.toDate();
      issue.slug = number.toString();
      issue.issue = number;
      issue.save(saved);
      function saved (err) {
        if (err) {
          end(err); return;
        }
        winston[level]('Weekly "%s" now scheduled for publication on %s.', issue.slug, moment(target).format('MMMM D, YYYY'));
        foundScheduledOrReady(null, issue);
      }
    }
  }
  function getPublicationTarget (issue) {
    // thursday, of the current week, at noon.
    var target = moment().day(4).startOf('day').add(12, 'hours');
    // if the target date is before the end of today, then wait until next week
    var tooLate = moment().endOf('day').isAfter(target);
    if (tooLate) {
      winston[level]('Weekly "%s" not scheduled because target is in the past (%s).', issue.slug, target.format('MMMM D, YYYY'));
      return null;
    }
    // if the target date is in over three days, then wait a few more hours
    var tooSoon = moment().add(3, 'days').isBefore(target);
    if (tooSoon) {
      winston[level]('Weekly "%s" not scheduled because target is in over three days (%s).', issue.slug, target.format('MMMM D, YYYY'));
      return null;
    }
    return target;
  }
  function releaseToPatrons (issue) {
    winston[level]('Weekly "%s" being released to patrons.', issue.slug);
    issue.status = 'released';
    issue.statusReach = 'patrons';
    issue.thanks = correcthorse();
    issue.save(saved);
    function saved (err) {
      if (err) {
        end(err); return;
      }
      sendToPatrons(issue);
    }
  }
  function releaseToEveryoneElse (issue) {
    winston[level]('Weekly "%s" being released to everyone.', issue.slug);
    issue.statusReach = 'everyone';
    issue.publication = new Date();
    issue.save(saved);
    function saved (err) {
      if (err) {
        end(err); return;
      }
      sendToEveryoneElse(issue);
      weeklyFeedService.rebuild();
    }
  }
  function sendToPatrons (issue) {
    winston[level]('Weekly "%s" being emailed to patrons.', issue.slug);
    weeklySharingService.email(issue, { patrons: 'only', thanks: issue.thanks }, end);
  }
  function sendToEveryoneElse (issue) {
    winston[level]('Weekly "%s" being emailed to everyone.', issue.slug);
    weeklySharingService.email(issue, { patrons: 'no' }, postToSocialMedia);
    function postToSocialMedia (err) {
      if (err) {
        end(err); return;
      }
      weeklySharingService.share(issue, end);
    }
  }
  function end (err) {
    log(err);
    winston[level]('Weekly scheduler job run finished.');
    (done || noop)(err);
  }
  function log (err) {
    if (err) {
      winston.warn('Weekly scheduler error.', err);
    }
  }
}

function noop () {}

module.exports = {
  run: run
};
