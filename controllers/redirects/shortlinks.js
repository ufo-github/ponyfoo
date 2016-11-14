'use strict'

const links = require(`../../dat/shortlinks.json`)
const settingService = require(`../../services/setting`)
const getSetting = settingService.tracker()

function setup (app) {
  app.get(`/bf/:shortlink?`, expandFromData)
  app.get(`/s/:shortlink`, expandFromData)
  app.get(`/s/:shortlink`, expandFromSettings)
}

function expandFromData (req, res, next) {
  const { path } = req
  go({ res, next, links, path })
}

function expandFromSettings (req, res, next) {
  getSetting(`SHORTLINKS`, (err, links = {}) => {
    if (err) {
      next(err); return
    }
    const { path } = req
    go({ res, next, links, path })
  })
}

function go ({ res, next, links, path }) {
  const url = path.toLowerCase()
  if (!Object.prototype.hasOwnProperty.call(links, url)) {
    next(); return
  }
  const link = links[url]
  res.status(302).redirect(link)
}

module.exports = {
  setup: setup
}
