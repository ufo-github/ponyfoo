'use strict';

var User = require('../models/User');

module.exports = function hydrateRequestWithRolesBeforeRender (vm, meta, done) {
  if (!meta.req.user) {
    hydrate(['anon']); return;
  }
  User.findOne({ _id: meta.req.user }).select('roles').exec(found);
  function found (err, user) {
    if (err) {
      done(err); return;
    }
    if (!user) {
      done(new Error('User not found.')); return;
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
