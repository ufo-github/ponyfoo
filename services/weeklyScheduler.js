'use strict';

var winston = require('winston');
var moment = require('moment');
var correcthorse = require('correcthorse');
var WeeklyIssue = require('../models/WeeklyIssue');
var weeklyFeedService = require('./weeklyFeed');
var weeklySharingService = require('./weeklySharing');

/*
 * [A] Find an issue that's released to patrons? Verify publication, update RSS feed & release to everyone else.
 * [B] Find an issue that's scheduled for release? Verify publication, release to patrons.
 * [C] Find an issue that's ready for release?
 *   [D] If next thursday is in 3 days or less: schedule & go back to [B].
 *   [E] Else do nothing
 * [F] Do nothing
 */
function run (done) {
  findReleasedToPatrons();
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
      findScheduledOrReady(); return;
    }
    if (moment(issue.publication).isBefore(moment())) {
      winston.debug('Found weekly "%s" in "patrons" status. Not ready for "everyone" yet.', issue.slug);
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
      winston.debug('No weeklies marked as "ready".', issue.slug);
      end(err);
      return;
    }
    if (issue.publication) {
      if (moment(issue.publication).subtract(1, 'days').isBefore(moment())) {
        winston.debug('Found weekly "%s" in "ready" status. Not ready for "patrons" yet!', issue.slug);
        end();
        return;
      }
      releaseToPatrons(issue);
    } else {
      attemptToSetPublicationDate(issue);
    }
  }
  function attemptToSetPublicationDate (issue) {
    var target = getPublicationTarget();
    if (!target) {
      winston.debug('Weekly "%s" is "ready" but it’s too soon to schedule it.', issue.slug);
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
      issue.publication = target;
      issue.statusReach = 'scheduled';
      issue.slug = number.toString();
      issue.issue = number;
      issue.save(saved);
      function saved (err) {
        if (err) {
          end(err); return;
        }
        winston.debug('Weekly "%s" now scheduled for publication on %s.', issue.slug, moment(issue.publication).format('MMMM D, YYYY'));
        foundScheduledOrReady(null, issue);
      }
    }
  }
  function getPublicationTarget () {
    // thursday, of the current week, at noon.
    var target = moment().day(4).startOf('day').add(12, 'hours');
    // if the target date is before the end of today, then wait until next week
    var tooLate = target.isBefore(moment().endOf('day'));
    // if the target date is in over three days, then wait a few more hours
    var tooSoon = moment(target).add(3, 'days').isAfter(moment());
    if (tooSoon || tooLate) {
      return;
    }
    return target;
  }
  function releaseToPatrons (readyIssue) {
    readyIssue.status = 'released';
    readyIssue.statusReach = 'patrons';
    readyIssue.thanks = correcthorse();
    readyIssue.save(saved);
    function saved (err) {
      if (err) {
        end(err); return;
      }
      sendToPatrons(readyIssue);
    }
  }
  function releaseToEveryoneElse (issue) {
    issue.statusReach = 'everyone';
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
    weeklySharingService.email(issue, { patrons: 'only', thanks: issue.thanks }, end);
  }
  function sendToEveryoneElse (issue) {
    weeklySharingService.email(issue, { patrons: 'no' }, end);
  }
  function end (err) {
    (done || log)(err);
  }
  function log (err) {
    if (err) {
      winston.warn('Error in weekly scheduler after setting update', err);
    }
  }
}

module.exports = {
  run: run
};
