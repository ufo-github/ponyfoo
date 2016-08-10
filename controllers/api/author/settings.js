'use strict';

const winston = require('winston');
const settingService = require('../../../services/setting');

module.exports = function (req, res, next) {
  const settings = getSettings(req.body);
  settingService.save(settings, saved);
  function saved (err) {
    if (err) {
      next(err); return;
    }
    res.redirect('/owner/settings');
  }
};

function getSettings (body) {
  const keys = toArray(body.setting_keys);
  const values = toArray(body.setting_values);
  const settings = keys.reduce(toSetting, {});
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
