'use strict';

var but = require('but');
var contra = require('contra');
var Setting = require('../models/Setting');

function get (next) {
  Setting.findOne({}).sort('-created').lean().exec(found);
  function found (err, setting) {
    if (err) {
      next(err); return;
    }
    next(null, setting && setting.items || {});
  }
}

function save (settings, done) {
  var model = new Setting({ items: settings });
  model.save(saved);

  function saved (err) {
    if (err) {
      done(err); return;
    }
    Setting
      .find({
        created: { $lt: model.created }
      })
      .sort('created')
      .exec(foundOld);
  }

  function foundOld (err, settings) {
    contra.each(settings, 3, remove, done);
    function remove (setting, next) {
      setting.remove(setting, next);
    }
  }
}

function toModel (settings) {
  return Object.keys(settings).map(intoKeyValuePair);
  function intoKeyValuePair (key) {
    var setting = settings[key];
    var value = setting === undefined ? '' : JSON.stringify(setting, null, 2);
    return {
      key: key,
      value: value
    };
  }
}

module.exports = {
  get: get,
  save: save,
  toModel: toModel
};
