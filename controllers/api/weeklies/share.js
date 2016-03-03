'use strict';

var winston = require('winston');
var WeeklyIssue = require('../../../models/WeeklyIssue');
var weeklySharingService = require('../../../services/weeklySharing');
var friendlyShared = {
  'email-self': 'an email just for yourself'
};

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  var medium = req.params.medium;
  WeeklyIssue.findOne({ slug: slug, status: 'released' }, found);

  function found (err, weekly) {
    if (err) {
      end('error', 'An unexpected error occurred.');
    } else if (!weekly) {
      end('error', 'That weekly issue can’t be shared.');
    } else if (medium !== 'email-self' && weekly.statusReach !== 'everyone') {
      end('error', 'That weekly issue can’t be shared via social media yet.');
    } else {
      share(weekly);
    }
  }

  function share (weekly) {
    var channel = weeklySharingService[medium];
    if (channel) {
      channel(weekly, { reshare: true, userId: req.user }, done);
    } else {
      end('error', 'Sharing medium "' + medium + '" is unknown.');
    }
    function done (err) {
      var mediumText = friendlyShared[medium] || medium;
      if (err) {
        winston.warn(err);
        end('error', 'Sharing via ' + mediumText + ' failed.');
      } else {
        end('success', 'Your weekly issue was shared via ' + mediumText + '.');
      }
    }
  }

  function end (type, message) {
    req.flash(type, message);
    res.redirect('/author/weeklies');
  }
};
