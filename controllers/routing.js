'use strict';

var jade = require('jade/runtime');
var taunus = require('taunus');
var routes = require('./routes');
var authenticationController = require('./authentication');
var verifyAccountEmail = require('./account/verifyEmail');
var markdownImageUpload = require('./api/markdown/images');
var articleList = require('./api/article/list');
var errors = require('../lib/errors');

global.jade = jade; // let jade have it their way

module.exports = function (app) {
  app.put('/api/markdown/images', markdownImageUpload);
  app.get('/api/articles', articleList);
  app.get('/account/verify-email/:token([a-f0-9]{24})', verifyAccountEmail);

  // app.post('/account/request-password-reset', passwordResetController.requestPasswordReset);
  // app.get('/account/password-reset/:token([a-f0-9]{24})', passwordResetController.validateToken);
  // app.post('/account/reset-password/:token([a-f0-9]{24})', passwordResetController.resetPassword);

  authenticationController.routing(app);

  taunus.mount(app, routes);
  app.use(errors.handler);
};
