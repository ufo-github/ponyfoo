'use strict'

const truncText = require(`trunc-text`)
const Presentation = require(`../../models/Presentation`)
const presentationService = require(`../../services/presentation`)
const htmlService = require(`../../services/html`)

module.exports = function (req, res, next) {
  Presentation.findOne({ slug: req.params.slug }, function (err, presentation) {
    if (err) {
      next(err); return
    }
    if (!presentation) {
      res.viewModel = { skip: true }
      next(); return
    }
    const descriptionText = htmlService.getText(presentation.descriptionHtml)
    const description = truncText(descriptionText, 170)
    const model = presentationService.toModel(presentation)
    res.viewModel = {
      model: {
        title: presentation.title,
        presentation: model,
        meta: {
          canonical: `/presentations/` + req.params.slug,
          description: description,
          images: presentationService.toCovers(presentation)
        }
      }
    }
    next()
  })
}
