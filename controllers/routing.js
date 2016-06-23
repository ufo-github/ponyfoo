'use strict';

var winston = require('winston');
var taunus = require('taunus');
var taunusExpress = require('taunus-express');
var transports = require('transports');
var multer = require('multer');
var routes = require('./routes');
var statusHealth = require('./api/status/health');
var authorSaveSetting = require('./api/author/setting');
var authorSaveSettings = require('./api/author/settings');
var authorEngagementsNew = require('./api/author/engagements-new');
var authorEngagementsRemove = require('./api/author/engagements-remove');
var authorPresentationsNew = require('./api/author/presentations-new');
var authorPresentationsRemove = require('./api/author/presentations-remove');
var authorOpenSourceProjectNew = require('./api/author/oss-new');
var authorOpenSourceProjectRemove = require('./api/author/oss-remove');
var invoiceNew = require('./api/invoices/create');
var invoiceUpdate = require('./api/invoices/update');
var invoiceRemove = require('./api/invoices/remove');
var invoicePartyNew = require('./api/invoices/party/create');
var invoicePartyUpdate = require('./api/invoices/party/update');
var invoicePartyRemove = require('./api/invoices/party/remove');
var twitterLead = require('./api/twitter/lead');
var verifyAccountEmail = require('./account/verifyEmail');
var registerAccount = require('./account/register');
var updateProfile = require('./api/account/updateProfile');
var imageUpload = require('./api/images/upload');
var rssFeed = require('./feeds/rss');
var metadataScrape = require('./api/metadata/scrape');
var authorEmail = require('./api/author/email');
var authorCompute = require('./author/compute');
var articleInsert = require('./api/articles/insert');
var articleUpdate = require('./api/articles/update');
var articleRemove = require('./api/articles/remove');
var articleShare = require('./api/articles/share');
var commentInsert = require('./api/comments/insert');
var commentRemove = require('./api/comments/remove');
var weeklyInsert = require('./api/weeklies/insert');
var weeklyUpdate = require('./api/weeklies/update');
var weeklyRemove = require('./api/weeklies/remove');
var weeklyShare = require('./api/weeklies/share');
var weeklyMediakit = require('./weekly/mediakit');
var subscriberInsert = require('./api/subscribers/insert');
var subscriberConfirm = require('./api/subscribers/confirm');
var subscriberRemove = require('./api/subscribers/remove');
var subscriberPollTwitterCards = require('./api/subscribers/poll-twitter-cards');
var gitOnly = require('./api/git/only');
var gitPushArticles = require('./api/git/push-articles');
var secretOnly = require('./api/secret/only');
var secretElasticsearchIndex = require('./api/secret/elasticsearch-index');
var secretScheduler = require('./api/secret/scheduler');
var secretWeeklies = require('./api/secret/weeklies');
var secretRemodel = require('./api/secret/remodel');
var secretTwitterLeads = require('./api/secret/twitter-leads');
var apiErrorNotFound = require('./api/error/notFound');
var lastSentEmail = require('./development/lastSentEmail');
var mediaKit = require('./development/pdf/mediakit');
var cspReport = require('./api/cspReport');
var sitemap = require('./sitemap/sitemap');
var authOnly = require('./account/only');
var ownerOnly = require('./author/roleOnly')(['owner']);
var invoiceOnly = require('./author/roleOnly')(['owner']);
var articlesOnly = require('./author/roleOnly')(['owner', 'editor', 'articles']);
var articlesEditorOnly = require('./author/roleOnly')(['owner', 'editor']);
var moderatorOnly = require('./author/roleOnly')(['owner', 'editor', 'moderator']);
var weekliesOnly = require('./author/roleOnly')(['owner', 'weeklies']);
var env = require('../lib/env');
var redirects = require('./redirects');
var getDefaultViewModel = require('./getDefaultViewModel');
var hydrateRequestModel = require('./hydrateRequestModel');
var verifyForm = require('./verifyForm');
var layout = require('../.bin/views/server/layout/layout');
var production = env('NODE_ENV') === 'production';
var upload = multer({ dest: '.bin/uploads' });

module.exports = function (app) {
  app.get('/api/csp-report', cspReport);
  app.get('/api/status/health', statusHealth);
  app.get('/api/:secret(\\d+)/elasticsearch', secretOnly, secretElasticsearchIndex);
  app.get('/api/:secret(\\d+)/scheduler', secretOnly, secretScheduler);
  app.get('/api/:secret(\\d+)/weeklies', secretOnly, secretWeeklies);
  app.get('/api/:secret(\\d+)/remodel', secretOnly, secretRemodel);
  app.get('/api/:secret(\\d+)/twitter-leads', secretOnly, secretTwitterLeads);

  app.get('/:id(articles|weekly|all)/feed', rssFeed);
  app.get('/sitemap.xml', sitemap);

  app.put('/api/images', upload.single('woofmark_upload'), imageUpload);

  app.get('/owner/articles/compute', ownerOnly, authorCompute);

  app.put('/api/articles', articlesOnly, articleInsert);
  app.patch('/api/articles/:slug', articlesOnly, articleUpdate);
  app.delete('/api/articles/:slug', articlesOnly, articleRemove);
  app.post('/api/articles/:slug/share/:medium', articlesEditorOnly, articleShare);

  app.put('/api/:type(articles|weeklies)/:slug/comments', commentInsert);
  app.post('/api/:type(articles|weeklies)/:slug/comments', verifyForm, commentInsert);
  app.delete('/api/:type(articles|weeklies)/:slug/comments/:id', moderatorOnly, commentRemove);

  app.put('/api/weeklies', weekliesOnly, weeklyInsert);
  app.patch('/api/weeklies/:slug', weekliesOnly, weeklyUpdate);
  app.delete('/api/weeklies/:slug', weekliesOnly, weeklyRemove);
  app.post('/api/weeklies/:slug/share/:medium', weekliesOnly, weeklyShare);
  app.get('/api/metadata/scrape', weekliesOnly, metadataScrape);

  app.put('/api/subscribers', subscriberInsert);
  app.post('/api/subscribers', verifyForm, subscriberInsert);
  app.get('/api/subscribers/poll-twitter-cards', ownerOnly, subscriberPollTwitterCards);
  app.get('/api/subscribers/:hash/confirm', subscriberConfirm);
  app.get('/api/subscribers/:hash/unsubscribe', subscriberRemove);

  app.post('/api/email', ownerOnly, authorEmail);

  app.post('/api/engagements/new', ownerOnly, authorEngagementsNew);
  app.post('/api/engagements/remove', ownerOnly, authorEngagementsRemove);
  app.post('/api/presentations/new', ownerOnly, authorPresentationsNew);
  app.post('/api/presentations/remove', ownerOnly, authorPresentationsRemove);
  app.post('/api/oss/new', ownerOnly, authorOpenSourceProjectNew);
  app.post('/api/oss/remove', ownerOnly, authorOpenSourceProjectRemove);
  app.post('/api/settings', ownerOnly, authorSaveSettings);
  app.post('/api/settings/:key', ownerOnly, authorSaveSetting);

  app.post('/api/invoices/parties/new', invoiceOnly, invoicePartyNew);
  app.post('/api/invoices/parties/:slug/edit', invoiceOnly, invoicePartyUpdate);
  app.post('/api/invoices/parties/:slug/remove', invoiceOnly, invoicePartyRemove);
  app.post('/api/invoices/new', invoiceOnly, invoiceNew);
  app.post('/api/invoices/:slug/edit', invoiceOnly, invoiceUpdate);
  app.post('/api/invoices/:slug/remove', invoiceOnly, invoiceRemove);

  app.patch('/api/account/profile', authOnly, updateProfile);
  app.post('/api/twitter-lead', twitterLead);
  app.all('/api/*', apiErrorNotFound);

  app.get('/account/verify-email/:token([a-f0-9]{24})', verifyAccountEmail);

  if (!production) {
    app.get('/dev/mediakit', mediaKit);
    app.get('/dev/last-email', lastSentEmail);
  }

  app.get('/weekly/sponsor/mediakit.pdf', weeklyMediakit);

  app.get('/api/git/push/articles', gitOnly, gitPushArticles);

  transports.routing(app, registerAccount);
  redirects.setup(app);

  taunusExpress(taunus, app, {
    version: env('APP_VERSION'),
    routes: routes,
    layout: layout,
    getDefaultViewModel: getDefaultViewModel,
    beforeRender: hydrateRequestModel,
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
