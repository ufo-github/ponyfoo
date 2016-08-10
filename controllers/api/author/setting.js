'use strict';

var settingService = require('../../../services/setting');

module.exports = function (req, res, next) {
  var key = req.params.key;
  var value = req.body.value;
  settingService.setKey(key, value, saved);
  function saved (err) {
    if (err) {
      next(err); return;
    }
    res.status(200).json({
      messages: ['Updated.']
    });
  }
};
