'use strict';

const contra = require(`contra`);
const winston = require(`winston`);
const useragent = require(`useragent`);
const User = require(`../models/User`);
const settingService = require(`../services/setting`);
const markdownService = require(`../services/markdown`);
const getSetting = settingService.tracker();
let bannerHtml = null;

module.exports = function hydrateRequestModel (vm, meta, done) {
  const rnonalpha = /[^a-z]/ig;
  const { req } = meta;
  const { user, userImpersonator } = req;
  const header = req.headers[`user-agent`];
  const ua = useragent.parse(header);

  vm.ua = ua.family.toLowerCase().replace(rnonalpha, ``);
  vm.bannerHtml = bannerHtml;

  getSetting(`HEADER_MARKDOWN`, bannerWatcher);

  function bannerWatcher (err, bannerMarkdown, fresh) {
    if (err) {
      winston.warn(`Error while fetching HEADER_MARKDOWN`, err); return;
    }
    if (fresh) {
      if (bannerMarkdown) {
        bannerHtml = markdownService.compile(bannerMarkdown);
      } else {
        bannerHtml = null;
      }
    }
    hydrateUser();
  }

  function hydrateUser () {
    if (!user) {
      hydrateRoles([`anon`]); return;
    }

    const tasks = {
      user: findUser(user)
    };
    if (userImpersonator) {
      tasks.userImpersonator = findUser(userImpersonator);
    }
    contra.concurrent(tasks, found);
  }

  function found (err, { user, userImpersonator } = {}) {
    if (err) {
      done(err); return;
    }
    if (!user) {
      done(new Error(`User not found.`)); return;
    }
    if (userImpersonator) {
      vm.model.userImpersonator = userImpersonator._id;
    }
    hydrateRoles(user.roles);
  }

  function hydrateRoles (roles) {
    vm.model.roles = roles.reduce(toRoleHash, {});
    done(null, vm);
  }
};

function toRoleHash (roles, role) {
  roles[role] = true;
  return roles;
}

function findUser (_id) {
  return done => User.findOne({ _id }).select(`roles`).exec(done);
}
