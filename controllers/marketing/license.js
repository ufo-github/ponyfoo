'use strict'

const markdownFileService = require(`../../services/markdownFile`)
const aboutFile = `./dat/license.md`

module.exports = function (req, res, next) {
  markdownFileService.read(aboutFile, respond)

  function respond (err, licenseHtml) {
    if (err) {
      next(err); return
    }
    res.viewModel = {
      model: {
        title: `License \u2014 Pony Foo`,
        meta: {
          canonical: `/license`
        },
        licenseHtml: licenseHtml
      }
    }
    next()
  }
}
