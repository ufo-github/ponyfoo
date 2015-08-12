'use strict';

var Log = require('../../models/Log');
var errorService = require('../../services/error');
var datetimeService = require('../../services/datetime');

module.exports = function (req, res, next) {
  var max = 100;
  var page = parseInt(req.params.page, 10) || 1;
  var p = page - 1;
  var start = max * p;

  Log.find({}).sort('-timestamp').skip(start).limit(max).exec(render);

  function render (err, logs) {
    if (err) {
      next('route'); return;
    }

    res.viewModel = {
      model: {
        title: 'Log Stream',
        logs: logs.map(cast),
        more: logs.length >= max,
        page: page
      }
    };
    next();
  }
};

function cast (log) {
  return {
    created: datetimeService.field(log.timestamp, true),
    message: log.message,
    level: log.level,
    meta: metaToModel(log.meta)
  };
}

function metaToModel (meta) {
  return {
    pid: meta.pid,
    hostname: meta.hostname,
    error: meta.stack ? errorService.toHtmlModel(meta.stack) : null,
    errorText: meta.stack ? errorService.toTextModel(meta.stack) : null
  };
}
