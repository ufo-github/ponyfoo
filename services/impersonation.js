'use strict';

const but = require(`but`);
const contra = require(`contra`);
const User = require(`../models/User`);
const userService = require(`../services/user`);

function set (options, done) {
  const tasks = {
    impersonator: findImpersonator
  };

  if (options._unset !== true) {
    tasks.impersonated = findImpersonated;
  }

  contra.concurrent(tasks, resolve);

  function findImpersonator (next) {
    User.findOne({ _id: options.impersonator }, next);
  }

  function findImpersonated (next) {
    User.findOne({ _id: options.impersonated }, next);
  }

  function resolve (err, result) {
    if (err) {
      done(err); return;
    }

    const { impersonator = null, impersonated = null } = result;
    if (impersonator === null) {
      invalid(`access_control`, `Impersonator couldn't be found.`); return;
    }
    if (options._unset === true) {
      persist(impersonator, null); return;
    }
    if (impersonated === null) {
      invalid(`access_control`, `The user to impersonate couldn't be found.`); return;
    }
    if (impersonated._id.equals(impersonator._id)) {
      invalid(`access_control`, `Impersonators can't impersonate themselves!`); return;
    }
    if (userService.hasRole(impersonated, `owner`)) {
      invalid(`access_control`, `Staff members can't be impersonated.`); return;
    }
    persist(impersonator, impersonated._id);
  }

  function persist (impersonator, impersonated) {
    impersonator.impersonated = impersonated;
    impersonator.save(but(done));
  }

  function invalid (name, reason) {
    done(null, { messages: [{ name, reasons: [reason] }] });
  }
}

function unset ({ impersonator }, done) {
  set({ impersonator, _unset: true }, done);
}

module.exports = {
  set,
  unset
};
