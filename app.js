'use strict'

require(`./preconfigure`)
require(`./chdir`)

const env = require(`./lib/env`)
const os = require(`os`)
const http = require(`http`)
const express = require(`express`)
const moment = require(`moment`)
const winston = require(`winston`)
const lipstick = require(`lipstick`)
const boot = require(`./lib/boot`)
const middleware = require(`./lib/middleware`)
const routing = require(`./controllers/routing`)
const development = require(`./lib/development`)
const articleFeedService = require(`./services/articleFeed`)
const weeklyFeedService = require(`./services/weeklyFeed`)
const sitemapService = require(`./services/sitemap`)
const shouldRebuild = !env(`APP_REBUILD`)
const port = env(`PORT`)

require(`./services/fullFeed`) // listens for events and auto-rebuilds
require(`./services/tweetToUnlock`).setup() // listens for events and tweets

function listen () {
  const app = express()
  const server = http.createServer(app)

  development.patch(app)

  global.moment = moment

  boot(booted)

  function booted () {
    middleware(app)
    development.statics(app)
    routing(app)
    development.errors(app)
    lipstick.listen(server, port, listening)
  }
}

function listening () {
  winston.info(`app listening on %s:%s`, os.hostname(), port)
  development.browserSync()

  if (shouldRebuild) {
    setTimeout(rebuild, random(1000, 5000))
  }
}

function rebuild () {
  articleFeedService.rebuild()
  weeklyFeedService.rebuild()
  sitemapService.rebuild()
}

function random (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

if (module.parent) {
  module.exports = listen
} else {
  listen()
}
