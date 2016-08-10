'use strict';

const winston = require('winston');
const taunus = require('taunus');
const taunusExpress = require('taunus-express');
const transports = require('transports');
const multer = require('multer');
const routes = require('./routes');
const statusHealth = require('./api/status/health');
const authorSaveSetting = require('./api/author/setting');
const authorSaveSettings = require('./api/author/settings');
const authorEngagementsNew = require('./api/author/engagements-new');
const authorEngagementsRemove = require('./api/author/engagements-remove');
const authorPresentationsNew = require('./api/author/presentations-new');
const authorPresentationsRemove = require('./api/author/presentations-remove');
const authorOpenSourceProjectNew = require('./api/author/oss-new');
const authorOpenSourceProjectRemove = require('./api/author/oss-remove');
const userCreate = require('./api/users/create');
const userUpdate = require('./api/users/update');
const userRemove = require('./api/users/remove');
const invoiceNew = require('./api/invoices/create');
const invoiceUpdate = require('./api/invoices/update');
const invoiceRemove = require('./api/invoices/remove');
const invoicePartyNew = require('./api/invoices/party/create');
const invoicePartyUpdate = require('./api/invoices/party/update');
const invoicePartyRemove = require('./api/invoices/party/remove');
const twitterLead = require('./api/twitter/lead');
const verifyAccountEmail = require('./account/verifyEmail');
const registerAccount = require('./account/register');
const updateProfile = require('./api/account/updateProfile');
const imageUpload = require('./api/images/upload');
const rssFeed = require('./feeds/rss');
const metadataScrape = require('./api/metadata/scrape');
const authorEmail = require('./api/author/email');
const authorCompute = require('./author/compute');
const articleInsert = require('./api/articles/insert');
const articleUpdate = require('./api/articles/update');
const articleRemove = require('./api/articles/remove');
const articleRemovePermanently = require('./api/articles/remove-permanently');
const articleRestore = require('./api/articles/restore');
const articleShare = require('./api/articles/share');
const getAllTags = require('./api/tags/get-all');
const updateKnownTag = require('./api/tags/update');
const removeKnownTag = require('./api/tags/remove');
const commentInsert = require('./api/comments/insert');
const commentRemoveJson = require('./api/comments/remove-json');
const commentRemoveRedirect = require('./api/comments/remove-redirect');
const weeklyInsert = require('./api/weeklies/insert');
const weeklyUpdate = require('./api/weeklies/update');
const weeklyRemove = require('./api/weeklies/remove');
const weeklyShare = require('./api/weeklies/share');
const weeklySubmission = require('./api/weeklies/submissions');
const weeklySubmissionRemove = require('./api/weeklies/submissions/remove');
const weeklySubmissionMark = require('./api/weeklies/submissions/mark');
const weeklyMediakit = require('./weekly/mediakit');
const subscriberInsert = require('./api/subscribers/insert');
const subscriberConfirm = require('./api/subscribers/confirm');
const subscriberRemove = require('./api/subscribers/remove');
const subscriberPollTwitterCards = require('./api/subscribers/poll-twitter-cards');
const secretOnly = require('./api/secret/only');
const secretElasticsearchIndex = require('./api/secret/elasticsearch-index');
const secretScheduler = require('./api/secret/scheduler');
const secretWeeklies = require('./api/secret/weeklies');
const secretRemodel = require('./api/secret/remodel');
const secretTwitterLeads = require('./api/secret/twitter-leads');
const apiErrorNotFound = require('./api/error/notFound');
const lastSentEmail = require('./development/lastSentEmail');
const mediaKit = require('./development/pdf/mediakit');
const cspReport = require('./api/cspReport');
const sitemap = require('./sitemap/sitemap');
const authOnly = require('./account/only');
const hydrateUserObject = require('./hydrateUserObject');
const ownerOnly = require('./author/roleOnly')(['owner']);
const invoiceOnly = require('./author/roleOnly')(['owner']);
const articlesOnly = require('./author/roleOnly')(['owner', 'editor', 'articles']);
const articlesEditorOnly = require('./author/roleOnly')(['owner', 'editor']);
const moderatorOnly = require('./author/roleOnly')(['owner', 'editor', 'moderator']);
const weekliesOnly = require('./author/roleOnly')(['owner', 'weeklies']);
const env = require('../lib/env');
const redirects = require('./redirects');
const getDefaultViewModel = require('./getDefaultViewModel');
const hydrateRequestModel = require('./hydrateRequestModel');
const verifyForm = require('./verifyForm');
const layout = require('../.bin/views/server/layout/layout');
const production = env('NODE_ENV') === 'production';
const upload = multer({ dest: '.bin/uploads' });

module.exports = function (app) {
  app.all('/*', hydrateUserObject);

  app.get('/api/csp-report', cspReport);
  app.get('/api/status/health', statusHealth);
  app.get('/api/:secret(\\d+)/elasticsearch', secretOnly, secretElasticsearchIndex);
  app.get('/api/:secret(\\d+)/scheduler', secretOnly, secretScheduler);
  app.get('/api/:secret(\\d+)/weeklies', secretOnly, secretWeeklies);
  app.get('/api/:secret(\\d+)/remodel', secretOnly, secretRemodel);
  app.get('/api/:secret(\\d+)/twitter-leads', secretOnly, secretTwitterLeads);

  app.get('/:id(articles|weekly|all)/feed', rssFeed);
  app.get('/sitemap.xml', sitemap);

  app.put('/api/images', upload.array('uploads', 5), imageUpload);
  app.get('/api/metadata/scrape', metadataScrape);

  app.get('/owner/articles/compute', ownerOnly, authorCompute);

  app.put('/api/articles', articlesOnly, articleInsert);

  app.get('/api/articles/tags', articlesOnly, getAllTags);
  app.post('/api/articles/tags', ownerOnly, updateKnownTag);
  app.post('/api/articles/tags/:slug', ownerOnly, updateKnownTag);
  app.post('/api/articles/tags/:slug/remove', ownerOnly, removeKnownTag);

  app.patch('/api/articles/:slug', articlesOnly, articleUpdate);
  app.delete('/api/articles/:slug', articlesOnly, articleRemove);
  app.delete('/api/articles/:slug/force', articlesOnly, articleRemovePermanently);
  app.post('/api/articles/:slug/restore', articlesOnly, articleRestore);
  app.post('/api/articles/:slug/share/:medium', articlesEditorOnly, articleShare);

  app.put('/api/:type(articles|weeklies)/:slug/comments', commentInsert);
  app.post('/api/:type(articles|weeklies)/:slug/comments', verifyForm, commentInsert);
  app.delete('/api/:type(articles|weeklies)/:slug/comments/:id', moderatorOnly, commentRemoveJson);
  app.get('/api/:type(articles|weeklies)/:slug/comments/:id/remove', moderatorOnly, commentRemoveRedirect);

  app.post('/api/weeklies/submissions', weeklySubmission);
  app.post('/api/weeklies/submissions/:slug', weeklySubmission);
  app.delete('/api/weeklies/submissions/:slug', ownerOnly, weeklySubmissionRemove);
  app.get('/api/weeklies/submissions/:slug/:action(accept|use)', ownerOnly, weeklySubmissionMark);

  app.put('/api/weeklies', weekliesOnly, weeklyInsert);
  app.patch('/api/weeklies/:slug', weekliesOnly, weeklyUpdate);
  app.delete('/api/weeklies/:slug', weekliesOnly, weeklyRemove);
  app.post('/api/weeklies/:slug/share/:medium', weekliesOnly, weeklyShare);

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

  app.put('/api/users', ownerOnly, userCreate);
  app.patch('/api/users/:id', ownerOnly, userUpdate);
  app.delete('/api/users/:id', ownerOnly, userRemove);

  app.patch('/api/account/profile', authOnly, updateProfile);
  app.post('/api/twitter-lead', twitterLead);
  app.all('/api/*', apiErrorNotFound);

  app.get('/account/verify-email/:token([a-f0-9]{24})', verifyAccountEmail);

  if (!production) {
    app.get('/dev/mediakit', mediaKit);
    app.get('/dev/last-email', lastSentEmail);
  }

  app.get('/weekly/sponsor/mediakit.pdf', weeklyMediakit);

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
