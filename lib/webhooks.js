'use strict';

const winston = require(`winston`);
const createHandler = require(`github-webhook-handler`);
const env = require(`./env`);
const articleGitService = require(`../services/articleGit`);
const secret = env(`X_HUB_SECRET`);

module.exports = webhooks;

function configure (app, key, ...events) {
  const path = `/api/git-hooks/${key}`;
  const handler = createHandler({ path, secret, events });
  app.use(handler);
  handler.on(`error`, err => {
    winston.warn(`Error in GitHub hook handler`, err.stack || err);
  });
  return handler;
}

function webhooks (app) {
  if (!secret) {
    return;
  }
  configure(app, `articles`, `push`).on(`push`, event => {
    articleGitService.pullFromGit(event);
  });
}
