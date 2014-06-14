'use strict';

var _ = require('lodash');
var passport = require('passport');
var unverifiedService = require('../services/unverified');
var data = require('../services/authentication/data');
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

var providers = {
  facebook: provider('facebook', { scope: 'email' }),
  github: provider('github'),
  google: provider('google'),
  linkedin: provider('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }),
};

function routing (app) {
  app.get(data.logout, logout);
  app.get(data.login, requireAnonymous);

  app.post(data.login, requireAnonymous, login, redirect);
  app.post(data.local, requireAnonymous, local, redirect);

  _.keys(providers).forEach(setup);

  function setup (name) {
    var provider = providers[name];
    var meta = data[name];
    if (!meta.enabled) {
      return;
    }
    app.get(meta.link, rememberReturnUrl, provider.auth);
    app.get(meta.callback, provider.callback, redirect);
  }
}

module.exports = {
  routing: routing
};
