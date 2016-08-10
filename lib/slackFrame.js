'use strict';

const slackin = require('slackin');
const env = require('./env');
const staticService = require('../services/static');
const slackOrganization = env('SLACK_ORG_NAME');
const slackApiToken = env('SLACK_API_TOKEN');
const slackFrameUrl = env('SLACK_FRAME_URL');
const css = staticService.unroll('/css/slackin.css');

function slackFrame () {
  if (!slackApiToken) {
    return missing;
  }
  const options = {
    token: slackApiToken,
    org: slackOrganization,
    path: slackFrameUrl,
    css: css,
    silent: true
  };
  const server = slackin.default(options);
  return server.app;
}

function missing (req, res, next) {
  next(new Error('Slack API key missing'));
}

module.exports = slackFrame;
