'use strict';

const pick = require(`lodash/pick`);
const contra = require(`contra`);
const env = require(`../env`);
const User = require(`../../models/User`);
const userService = require(`../../services/user`);
const unlockCodeService = require(`../../services/unlockCode`);
const registration = env(`REGISTRATION_OPEN`);

module.exports = function providerHandler (req, query, profile, done) {
  const email = profile.emails ? profile.emails[0].value : false;
  if (!email) {
    done(null, false, `Unable to fetch email address`); return;
  }

  const passportSuccessRedirect = req.flash(`passportSuccessRedirect`);
  if (passportSuccessRedirect) {
    req.session.redirect = passportSuccessRedirect;
  }

  contra.waterfall([
    function findByProvider (next) {
      const fields = Object.keys(query).filter(key => key.endsWith(`Id`));
      const userQuery = pick(query, fields);
      User.findOne(userQuery, next);
    },
    function findByEmail (user, next) {
      if (user) {
        next(null, user); return;
      }
      User.findOne({ email: email }, next);
    },
    function updateUser (user, next) {
      if (!registration && !user) {
        next(new Error(`Registration is closed to the public.`)); return;
      }
      const model = attachTo(user);
      model.save(saved);

      function saved (err, user){
        next(err, user ? user.toObject() : null);
      }
    }
  ], done);

  function attachTo (user) {
    if (!user) { // register user
      return createUser();
    }
    return updatedUser();

    function createUser () {
      query.email = email;
      query.displayName = profile.displayName;
      query.roles = userService.defaultRoles;
      query.unlockCodes = [];
      addUnlockCodes(query);
      return new User(query);
    }

    function updatedUser () {
      Object.keys(query).forEach(key => { // add providerId to user
        user[key] = query[key];
      });
      if (!user.displayName) {
        user.displayName = profile.displayName;
      }
      addUnlockCodes(user);
      return user;
    }

    function addUnlockCodes (user) {
      const unlockCodes = req.flash(`passportUnlockCode`) || [];
      unlockCodes.forEach(code => {
        if (user.unlockCodes.indexOf(code) === -1) {
          user.unlockCodes.push(code);
          unlockCodeService.emit(`added`, { user, code });
        }
      });
    }
  }
};
