'use strict'

const sluggish = require(`sluggish`)
const env = require(`../../lib/env`)
const data = require(`../../lib/authentication/data`)
const inliningService = require(`../../services/inlining`)
const registration = env(`REGISTRATION_OPEN`)
const providers = Object.keys(data.providers).filter(enabled).map(toProviderModel)

function enabled (key) {
  return data.providers[key].enabled
}

function toProviderModel (key) {
  const { name, link, css } = data.providers[key]
  const slug = sluggish(key)
  return { name, link, css, slug }
}

module.exports = function (req, res, next) {
  if (req.user) {
    return // case handled by transports package
  }
  res.viewModel = {
    model: {
      title: `Login \u2014 Pony Foo`,
      meta: {
        canonical: `/account/login`
      },
      registration,
      providers
    }
  }
  inliningService.addStyles(res.viewModel.model, `login`)
  next()
}
