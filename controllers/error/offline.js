'use strict'

const offline = `/offline`
const inliningService = require(`../../services/inlining`)

module.exports = function (req, res, next) {
  res.status(200)
  res.viewModel = {
    model: {
      title: `Application Offline`,
      action: `error/offline`,
      meta: {
        canonical: offline
      }
    }
  }
  inliningService.addStyles(res.viewModel.model, `errors`)
  next()
}
