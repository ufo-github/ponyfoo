'use strict';

var settingService = require('../../../services/setting');
var weeklySchedulerService = require('../../../services/weeklyScheduler');
var wasEnabledLastTime = false;

settingService.on('save', saved);

function saved (settings) {
  var enabled = settings.PONYFOOWEEKLY_CRON === true;
  if (!wasEnabledLastTime && enabled) {
    weeklySchedulerService.run();
  }
  wasEnabledLastTime = enabled;
}

function weeklies (req, res, next) {
  settingService.getKey('PONYFOOWEEKLY_CRON', got);
  function got (err, enabled) {
    if (err) {
      next(err); return;
    }
    if (enabled !== true) {
      res.json({ enabled: enabled === undefined ? '(unset)' : false }); return;
    }
    weeklySchedulerService.run(scheduled);
    function scheduled (err) {
      if (err) {
        next(err); return;
      }
      res.json({});
    }
  }
}

module.exports = weeklies;
