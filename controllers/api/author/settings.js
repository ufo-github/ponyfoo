'use strict';

var _ = require('lodash');
var winston = require('winston');
var moment = require('moment');
var Setting = require('../../../models/Setting');
var settingService = require('../../../services/setting');

module.exports = function (req, res, next) {
  var settings = getSettings(req.body);
  settingService.save(settings, saved);
  function saved (err) {
    if (err) {
      next(err); return;
    }
    res.redirect('/author/settings');
  }
};

function getSettings (body) {
  var keys = toArray(body.setting_keys);
  var values = toArray(body.setting_values);
  var settings = keys.reduce(toSetting, {});
  return settings;
  function toSetting (settings, key, i) {
    try {
      settings[key] = values[i] === '' ? undefined : JSON.parse(values[i]);
    } catch (e) {
      winston.debug('Failed to save setting %s when parsing user-provided value as JSON.', key);
    }
    return settings;
  }
}

function toArray (field) {
  return Array.isArray(field) ? field : [field];
}
