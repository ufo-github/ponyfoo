'use strict'

const $ = require(`dominus`)
const taunus = require(`taunus`)
const isElementInViewport = require(`../lib/isElementInViewport`)
const logo = $.findOne(`.go-anchor`)
const $logo = $(logo)
const loader = $logo
  .clone()
  .appendTo(document.body)
  .removeClass(`go-anchor`)
  .addClass(`ll-loading`)
  .addClass(`gg-continuous`)

function show () {
  const justLogo = isElementInViewport(logo, false)
  if (!justLogo) {
    loader.addClass(`ll-show`)
  }
  $logo.addClass(`gg-continuous`)
}

function hide () {
  $logo.removeClass(`gg-continuous`)
  loader.removeClass(`ll-show`)
}

function loading () {
  taunus.on(`fetch.start`, show)
  taunus.on(`fetch.done`, hide)
  taunus.on(`fetch.abort`, hide)
  taunus.on(`fetch.error`, hide)
}

loading.show = show
loading.hide = hide
module.exports = loading
