'use strict';

var unverifiedService = require('../services/unverified');
var authentication = require('../lib/authentication');
var data = require('../lib/authentication/data');

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
    res.redirect(data.login);
  }
}

function routing (app) {
  authentication.routing(app, register);
}

module.exports = {
  routing: routing
};
