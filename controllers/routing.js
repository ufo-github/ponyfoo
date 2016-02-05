'use strict';

var winston = require('winston');
var taunus = require('taunus');
var taunusExpress = require('taunus-express');
var transports = require('transports');
var routes = require('./routes');
var statusHealth = require('./api/status/health');
var authorEngagementsNew = require('./api/author/engagements-new');
var authorEngagementsRemove = require('./api/author/engagements-remove');
var authorPresentationsNew = require('./api/author/presentations-new');
var authorPresentationsRemove = require('./api/author/presentations-remove');
var authorOpenSourceProjectNew = require('./api/author/oss-new');
var authorOpenSourceProjectRemove = require('./api/author/oss-remove');
var twitterLead = require('./api/twitter/lead');
var verifyAccountEmail = require('./account/verifyEmail');
var registerAccount = require('./account/register');
var bioUpdate = require('./api/account/bioUpdate');
var markdownImageUpload = require('./api/markdown/images');
var authorEmail = require('./api/author/email');
var authorCompute = require('./author/compute');
var articleInsert = require('./api/articles/insert');
var articleUpdate = require('./api/articles/update');
var articleRemove = require('./api/articles/remove');
var articleShare = require('./api/articles/share');
var articleFeed = require('./articles/feed');
var commentInsert = require('./api/comments/insert');
var commentRemove = require('./api/comments/remove');
var subscriberInsert = require('./api/subscribers/insert');
var subscriberConfirm = require('./api/subscribers/confirm');
var subscriberRemove = require('./api/subscribers/remove');
var gitOnly = require('./api/git/only');
var gitPushArticles = require('./api/git/push-articles');
var secretOnly = require('./api/secret/only');
var secretScheduler = require('./api/secret/scheduler');
var secretRemodel = require('./api/secret/remodel');
var secretTwitterLeads = require('./api/secret/twitter-leads');
var apiErrorNotFound = require('./api/error/notFound');
var lastSentEmail = require('./development/lastSentEmail');
var cspReport = require('./api/cspReport');
var sitemap = require('./sitemap/sitemap');
var authOnly = require('./account/only');
var authorOnly = require('./author/only');
var env = require('../lib/env');
var redirects = require('./redirects');
var getDefaultViewModel = require('./getDefaultViewModel');
var verifyForm = require('./verifyForm');
var layout = require('../.bin/views/server/layout/layout');
var production = env('NODE_ENV') === 'production';

module.exports = function (app) {
  app.get('/api/csp-report', cspReport);
  app.get('/api/status/health', statusHealth);
  app.get('/api/:secret(\\d+)/scheduler', secretOnly, secretScheduler);
  app.get('/api/:secret(\\d+)/remodel', secretOnly, secretRemodel);
  app.get('/api/:secret(\\d+)/twitter-leads', secretOnly, secretTwitterLeads);

  app.get('/articles/feed', articleFeed);
  app.get('/sitemap.xml', sitemap);

  app.put('/api/markdown/images', markdownImageUpload);

  app.put('/api/articles', authorOnly, articleInsert);
  app.patch('/api/articles/:slug', authorOnly, articleUpdate);
  app.delete('/api/articles/:slug', authorOnly, articleRemove);
  app.post('/api/articles/:slug/share/:medium', authorOnly, articleShare);

  app.get('/author/compute', authorOnly, authorCompute);

  app.put('/api/articles/:slug/comments', commentInsert);
  app.post('/api/articles/:slug/comments', verifyForm, commentInsert);
  app.delete('/api/articles/:slug/comments/:id', authorOnly, commentRemove);

  app.put('/api/subscribers', subscriberInsert);
  app.post('/api/subscribers', verifyForm, subscriberInsert);
  app.get('/api/subscribers/:hash/confirm', subscriberConfirm);
  app.get('/api/subscribers/:hash/unsubscribe', subscriberRemove);

  app.post('/api/email', authorOnly, authorEmail);

  app.post('/api/engagements/new', authorOnly, authorEngagementsNew);
  app.post('/api/engagements/remove', authorOnly, authorEngagementsRemove);
  app.post('/api/presentations/new', authorOnly, authorPresentationsNew);
  app.post('/api/presentations/remove', authorOnly, authorPresentationsRemove);
  app.post('/api/oss/new', authorOnly, authorOpenSourceProjectNew);
  app.post('/api/oss/remove', authorOnly, authorOpenSourceProjectRemove);

  app.patch('/api/account/bio', authOnly, bioUpdate);
  app.post('/api/twitter-lead', twitterLead);
  app.all('/api/*', apiErrorNotFound);

  app.get('/account/verify-email/:token([a-f0-9]{24})', verifyAccountEmail);

  if (!production) {
    app.get('/dev/last-email', lastSentEmail);
  }

  app.get('/api/git/push/articles', gitOnly, gitPushArticles);

  transports.routing(app, registerAccount);
  redirects.setup(app);

  taunusExpress(taunus, app, {
    version: env('APP_VERSION'),
    routes: routes,
    layout: layout,
    getDefaultViewModel: getDefaultViewModel,
    plaintext: {
      root: 'article', ignore: 'footer,.mm-count,.at-meta'
    },
    deferMinified: production
  });
  app.use(errorHandler);

  function errorHandler (err, req, res, next) {
    if (err) {
      winston.warn(err);
    }
    next(err);
  }
};
