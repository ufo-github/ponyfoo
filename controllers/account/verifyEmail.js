'use strict';

var contra = require('contra');
var verificationService = require('../../services/verification');

module.exports = function (req, res, next) {
  contra.waterfall([
      contra.curry(verificationService.verifyToken, req.params.token),
      function flashResult (result, done) {
        req.flash(result.status, result.message);
        done(null, result.user);
      },
      function userLogin (user, done) {
        if (user) {
          req.login(user, done);
        } else {
          done();
        }
      }
  ], function respond (err) {
    if (err) {
      next(err); return;
    }
    res.redirect('/');
  });
};
