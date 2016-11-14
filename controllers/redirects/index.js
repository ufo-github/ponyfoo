'use strict'

const legacy = require(`./legacy`)
const shortlinks = require(`./shortlinks`)

function setup (app) {
  legacy.setup(app)
  shortlinks.setup(app)
}

module.exports = { setup }
