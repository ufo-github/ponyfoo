'use strict'

const $ = require(`dominus`)
const taunus = require(`taunus`)
const env = require(`../lib/env`)
const gaSnippet = require(`./ga-snippet`)
const main = $.findOne(`.ly-main`)
const property = env(`GA_PROPERTY`)

module.exports = function ga () {
  if (!property) {
    return
  }

  gaSnippet()

  global.ga(`create`, property, `auto`)
  taunus.on(`render`, render)

  function render (container) {
    if (container === main) {
      global.ga(`send`, `pageview`)
    }
  }
}
