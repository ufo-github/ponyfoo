'use strict';

var env = require('../../lib/env');
var markdownFileService = require('../../services/markdownFile');
var slackFrameUrl = env('SLACK_FRAME_URL');
var slackFile = './dat/slack.md';

module.exports = function (req, res, next) {
  markdownFileService.read(slackFile, respond);

  function respond (err, slackHtml) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Join our Slack community \u2014 Pony Foo',
        meta: {
          canonical: '/slack'
        },
        slackFrameUrl: slackFrameUrl,
        slackHtml: slackHtml
      }
    };
    next();
  }
};
