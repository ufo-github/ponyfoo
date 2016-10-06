'use strict';

const pick = require(`lodash/pick`);
const contra = require(`contra`);
const winston = require(`winston`);
const env = require(`../env`);
const User = require(`../../models/User`);
const userService = require(`../../services/user`);
const unlockCodeService = require(`../../services/unlockCode`);
const subscriberUserService = require(`../../services/subscriberUser`);
const openRegistration = env(`REGISTRATION_OPEN`);

module.exports = function providerHandler (req, query, profile, done) {
  const email = profile.emails ? profile.emails[0].value : false;
  if (!email) {
    done(null, false, `Unable to fetch email address`); return;
  }

  const passportSuccessRedirect = req.flash(`passportSuccessRedirect`) || [];
  if (passportSuccessRedirect.length) {
    req.session.redirect = passportSuccessRedirect[0];
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
    function findBySession (user, next) {
      if (user) {
        next(null, user); return;
      }
      if (!req.user) {
        next(null, null); return;
      }
      User.findOne({ _id: req.user }, next);
    },
    function updateUser (user, next) {
      if (!openRegistration && !user) {
        next(new Error(`Registration is closed to the public.`)); return;
      }
      const model = user ? attachToUser(user) : createUser();
      model.save(saved);

      function saved (err, user){
        next(err, user ? user.toObject() : null);
      }
    }
  ], done);

  function createUser () {
    query.email = email;
    query.displayName = profile.displayName;
    query.roles = userService.defaultRoles;
    query.unlockCodes = [];
    const addedCodes = addUnlockCodes(query);
    const user = new User(query);
    subscriberUserService.add({ user, codes: addedCodes });
    winston.info(`Creating user account for: ${email}.`);
    return user;
  }

  function attachToUser (user) {
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
    const addedCodes = [];
    unlockCodes.forEach(code => {
      if (user.unlockCodes.indexOf(code) === -1) {
        user.unlockCodes.push(code);
        addedCodes.push(code);
        unlockCodeService.emit(`added`, { user, code });
      }
    });
    return addedCodes;
  }
};
