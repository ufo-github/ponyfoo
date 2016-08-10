'use strict';

var contra = require('contra');
var Setting = require('../models/Setting');
var api = contra.emitter({
  get: get,
  getKey: getKey,
  setKey: setKey,
  save: save,
  toModel: toModel
});

function get (done) {
  Setting.findOne({}).sort('-created').lean().exec(found);
  function found (err, setting) {
    if (err) {
      done(err); return;
    }
    done(null, setting && setting.items || {});
  }
}

function getKey (key, done) {
  get(found);
  function found (err, settings) {
    if (err) {
      done(err); return;
    }
    done(null, settings[key]);
  }
}

function setKey (key, value, done) {
  get(found);
  function found (err, settings) {
    if (err) {
      done(err); return;
    }
    settings[key] = value;
    save(settings, done);
  }
}

function save (settings, done) {
  var model = new Setting({ items: settings });
  model.save(saved);

  function saved (err) {
    if (err) {
      done(err); return;
    }
    api.emit('save', settings);
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

module.exports = api;
