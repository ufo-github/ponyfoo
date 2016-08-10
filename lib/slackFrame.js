'use strict';

var slackin = require('slackin');
var env = require('./env');
var staticService = require('../services/static');
var slackOrganization = env('SLACK_ORG_NAME');
var slackApiToken = env('SLACK_API_TOKEN');
var slackFrameUrl = env('SLACK_FRAME_URL');
var css = staticService.unroll('/css/slackin.css');

function slackFrame () {
  if (!slackApiToken) {
    return missing;
  }
  var options = {
    token: slackApiToken,
    org: slackOrganization,
    path: slackFrameUrl,
    css: css,
    silent: true
  };
  var server = slackin.default(options);
  return server.app;
}

function missing (req, res, next) {
  next(new Error('Slack API key missing'));
}

module.exports = slackFrame;
