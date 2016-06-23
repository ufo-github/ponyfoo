'use strict';

var useragent = require('useragent');
var User = require('../models/User');

module.exports = function hydrateRequestModel (vm, meta, done) {
  var rnonalpha = /[^a-z]/ig;
  var req = meta.req;
  var user = req.user;
  var header = req.headers['user-agent'];
  var ua = useragent.parse(header);

  vm.ua = ua.family.toLowerCase().replace(rnonalpha, '');

  if (!user) {
    hydrate(['anon']); return;
  }
  User.findOne({ _id: user }).select('roles').exec(found);
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
