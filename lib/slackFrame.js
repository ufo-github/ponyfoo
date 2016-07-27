'use strict';

var slackin = require('slackin');
var env = require('./env');
var slackOrganization = env('SLACK_ORG_NAME');
var slackApiToken = env('SLACK_API_TOKEN');
var staticService = require('../services/static');
var css = staticService.unroll('/css/slackin.css');
var slackFrameUrl = env('SLACK_FRAME_URL');
var nodeEnv = env('NODE_ENV');
var dev = nodeEnv === 'development';

function slackFrame () {
  var options = {
    token: slackApiToken,
    org: slackOrganization,
    path: slackFrameUrl,
    css: css,
    silent: !dev
  };
  var server = slackin.default(options);
  return server.app;
}

module.exports = slackFrame;
