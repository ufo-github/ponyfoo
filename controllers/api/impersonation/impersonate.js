'use strict'

const httpService = require(`../../../services/http`)
const impersonationService = require(`../../../services/impersonation`)

module.exports = function (req, res, next) {
  impersonationService.set({
    impersonator: req.user,
    impersonated: req.params.id
  }, respond)

  function respond (err) {
    if (err) {
      next(err); return
    }
    httpService.redirect(req, res, `/`, { hard: true })
  }
}
