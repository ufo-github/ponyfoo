'use strict';

var passport = require('passport');
var unverifiedService = require('../../../service/unverified');
var data = require('../../services/authentication/data');
var authenticationOptions = {
  failureRedirect: data.login,
  failureFlash: true // TODO no-flash
};
var login = passport.authenticate('local', authenticationOptions);

function local (req, res, next) {
  if (!req.body.create) {
    login(req, res, next);
  } else {
    register(req, res, next);
  }
}

function register (req, res, next) {
  unverifiedService.register({
    email: req.body.email,
    password: req.body.password
  }, validate);

  function validate (err, validation) {
    if (err) {
      next(err); return;
    }

    if (validation) {
      req.flash('error', validation);
    } else {
      req.flash('success', 'Activation instructions sent to your email!');
    }
    return res.redirect(data.login);
  }
}

function provider (name, options) {
  return {
    auth: passport.authenticate(name, options),
    callback: passport.authenticate(name, authenticationOptions)
  };
}

function rememberReturnUrl (req, res, next) {
  req.session.redirect = req.query.redirect;
  next();
}

function redirect (req, res) {
  var sessionRedirect = req.session.redirect;
  delete req.session.redirect;
  res.redirect(req.body.redirect || sessionRedirect || data.success);
}

function requireAnonymous (req, res, next) {
  if (!!req.user) {
    redirect(req,res);
  }
  next();
}

function logout (req, res) {
  req.logout();
  res.redirect('/');
}

module.exports = {
  requireAnonymous: requireAnonymous,

  rememberReturnUrl: rememberReturnUrl,
  redirect: redirect,

  login: login,
  local: local,

  facebook: provider('facebook', { scope: 'email' }),
  github: provider('github'),
  google: provider('google'),
  linkedin: provider('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }),

  logout: logout
};
