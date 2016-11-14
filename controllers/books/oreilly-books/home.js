'use strict'

const contra = require(`contra`)
const assign = require(`assignment`)
const atlasService = require(`../../../services/atlas`)
const oreillyService = require(`../../../services/oreilly`)
const helper = require(`./lib/helper`)

module.exports = function (req, res, next) {
  const bookSlug = req.params.slug

  contra.concurrent({
    meta: next => oreillyService.getMetadata({ bookSlug }, next),
    firstChapter: next => atlasService.getFirstChapterLink(bookSlug, next)
  }, respond)

  function respond (err, { meta, firstChapter } = {}) {
    if (err) {
      next(err); return
    }
    if (!meta) {
      next(`route`); return
    }
    res.viewModel = {
      model: assign(helper.getBaseModel({ bookSlug, meta, canonical: `` }), {
        firstChapter,
        home: meta.homeHtml
      })
    }
    next()
  }
}
