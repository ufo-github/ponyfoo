'use strict'

const env = require(`../../lib/env`)
const markdownFileService = require(`../../services/markdownFile`)
const slackFrameUrl = env(`SLACK_FRAME_URL`)
const slackFile = `./dat/slack.md`

module.exports = function (req, res, next) {
  markdownFileService.read(slackFile, respond)

  function respond (err, slackHtml) {
    if (err) {
      next(err); return
    }
    res.viewModel = {
      model: {
        title: `Join our Slack community \u2014 Pony Foo`,
        meta: {
          canonical: `/slack`
        },
        slackFrameUrl: slackFrameUrl,
        slackHtml: slackHtml
      }
    }
    next()
  }
}
