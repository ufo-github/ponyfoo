'use strict';

var WeeklyIssue = require('../../../models/WeeklyIssue');
var weeklySharingService = require('../../../services/weeklySharing');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  var medium = req.params.medium;

  WeeklyIssue.findOne({ slug: slug, status: 'released', statusReach: 'everyone' }, found);

  function found (err, weekly) {
    if (err) {
      end('error', 'An unexpected error occurred.');
    } else if (!weekly) {
      end('error', 'The weekly issue can’t be shared.');
    } else {
      share(weekly);
    }
  }

  function share (weekly) {
    var channel = weeklySharingService[medium];
    if (channel) {
      channel(weekly, { reshare: true }, done);
    } else {
      end('error', 'Sharing medium "' + medium + '" is unknown.');
    }
    function done (err) {
      if (err) {
        end('error', 'Sharing via ' + medium + ' failed.');
      } else {
        end('success', 'Your weekly issue was shared via ' + medium + '.');
      }
    }
  }

  function end (type, message) {
    req.flash(type, message);
    res.redirect('/author/weeklies');
  }
};
