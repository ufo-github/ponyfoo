'use strict';

var taunus = require('taunus');
var transports = require('transports');
var routes = require('./routes');
var verifyAccountEmail = require('./account/verifyEmail');
var registerAccount = require('./account/register');
var markdownImageUpload = require('./api/markdown/images');
var articleList = require('./api/articles/list');
var articleInsert = require('./api/articles/insert');
var articleUpdate = require('./api/articles/update');
var articleRemove = require('./api/articles/remove');
var articleCompute = require('./api/articles/compute');
var articleFeed = require('./articles/feed');
var subscriberInsert = require('./api/subscribers/insert');
var subscriberConfirm = require('./api/subscribers/confirm');
var subscriberRemove = require('./api/subscribers/remove');
var sitemap = require('./sitemap/sitemap');
var authorOnly = require('./author/only');
var errors = require('../lib/errors');
var redirects = require('./redirects');
var defaultRequestModel = require('./defaultRequestModel');

module.exports = function (app) {
  app.get('/articles/feed', articleFeed);
  app.get('/sitemap.xml', sitemap);

  app.put('/api/markdown/images', markdownImageUpload);

  app.get('/api/articles', authorOnly, articleList);
  app.put('/api/articles', authorOnly, articleInsert);
  app.patch('/api/articles/:slug', authorOnly, articleUpdate);
  app.delete('/api/articles/:slug', authorOnly, articleRemove);
  app.post('/api/articles/compute-relationships', authorOnly, articleCompute);

  app.put('/api/subscribers', subscriberInsert);
  app.get('/api/subscribers/:hash/confirm', subscriberConfirm);
  app.get('/api/subscribers/:hash/unsubscribe', subscriberRemove);

  app.get('/account/verify-email/:token([a-f0-9]{24})', verifyAccountEmail);

  // app.post('/account/password-reset', requestPasswordReset);
  // app.get('/account/password-reset/:token([a-f0-9]{24})', validateToken);
  // app.post('/account/password-reset/:token([a-f0-9]{24})', resetPassword);

  transports.routing(app, registerAccount);

  taunus.mount(app, routes, {
    defaultRequestModel: defaultRequestModel
  });
  redirects.setup(app);
  app.use(errors.handler);
};
