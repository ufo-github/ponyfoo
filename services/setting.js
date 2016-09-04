'use strict';

const contra = require(`contra`);
const Setting = require(`../models/Setting`);
const api = contra.emitter({
  tracker,
  get,
  getKey,
  setKey,
  save,
  toModel
});

function tracker () {
  let cached = null;
  return (key, done) => {
    if (!done) {
      done = key;
      key = null;
    }
    if (cached) {
      done(null, select(cached)); return;
    }
    get((err, items) => {
      if (err) {
        done(err); return;
      }
      done(null, select(items));
      cached = items;
      api.on(`save`, items => {
        cached = items;
      });
    });
    function select (items) {
      return typeof key === `string` ? items[key] : items;
    }
  };
}

function get (done) {
  Setting.findOne({}).sort(`-created`).lean().exec(found);
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
  const model = new Setting({ items: settings });
  model.save(saved);

  function saved (err) {
    if (err) {
      done(err); return;
    }
    api.emit(`save`, settings);
    Setting
      .find({
        created: { $lt: model.created }
      })
      .sort(`created`)
      .exec(foundOld);
  }

  function foundOld (err, settings) {
    if (err) {
      done(err); return;
    }
    contra.each(settings, 3, remove, done);
    function remove (setting, next) {
      setting.remove(setting, next);
    }
  }
}

function toModel (settings) {
  return Object.keys(settings).map(intoKeyValuePair);
  function intoKeyValuePair (key) {
    const setting = settings[key];
    const value = setting === undefined ? `` : JSON.stringify(setting, null, 2);
    return {
      key: key,
      value: value
    };
  }
}

module.exports = api;
