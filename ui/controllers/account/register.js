'use strict';

const unverifiedService = require(`../../services/unverified`);
const data = require(`../../lib/authentication/data`);
const env = require(`../../lib/env`);
const registration = env(`REGISTRATION_OPEN`);

function register (req, res, next) {
  if (!registration) {
    req.flash(`error`, [`Registration is closed to the public.`]);
    res.redirect(`/`);
    return;
  }

  unverifiedService.register({
    email: req.body.email,
    password: req.body.password
  }, validate);

  function validate (err, validation) {
    if (err) {
      next(err); return;
    }

    if (validation) {
      req.flash(`error`, validation);
    } else {
      req.flash(`success`, `Activation instructions sent to your email!`);
    }
    res.redirect(data.login);
  }
}

module.exports = register;
