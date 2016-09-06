'use strict';

const contra = require(`contra`);
const useragent = require(`useragent`);
const User = require(`../models/User`);

module.exports = function hydrateRequestModel (vm, meta, done) {
  const rnonalpha = /[^a-z]/ig;
  const { req } = meta;
  const { user, userImpersonator } = req;
  const header = req.headers[`user-agent`];
  const ua = useragent.parse(header);

  vm.ua = ua.family.toLowerCase().replace(rnonalpha, ``);

  if (!user) {
    hydrate([`anon`]); return;
  }

  const tasks = {
    user: findUser(user)
  };
  if (userImpersonator) {
    tasks.userImpersonator = findUser(userImpersonator);
  }
  contra.concurrent(tasks, found);

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
    hydrate(user.roles);
  }

  function hydrate (roles) {
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
