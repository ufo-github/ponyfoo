'use strict'

const env = require(`../../lib/env`)
const staticService = require(`../../services/static`)
const markdownFileService = require(`../../services/markdownFile`)
const authority = env(`AUTHORITY`)
const guidelinesFile = `./dat/contributing-guidelines.md`

module.exports = function (req, res, next) {
  markdownFileService.read(guidelinesFile, respond)

  function respond (err, guidelines) {
    if (err) {
      next(err); return
    }
    res.viewModel = {
      model: {
        title: `Join Our Team! \u2014 Pony Foo`,
        meta: {
          canonical: `/contributors/join-us`,
          description: `Join the contributors and writers collaborating on Pony Foo!`,
          images: [authority + staticService.unroll(`/img/articles.png`)]
        },
        guidelines: guidelines
      }
    }
    next()
  }
}
