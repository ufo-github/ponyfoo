'use strict'

const $ = require(`dominus`)
const taunus = require(`taunus`)
const body = $.findOne(`body`)

function bind () {
  taunus.on(`start`, unwrapFrames.bind(null, body))
  taunus.on(`render`, unwrapFrames)
}

function unwrapFrames (container) {
  $(container).find(`iframe[data-src]`).forEach(unwrap)
}

function unwrap (iframe) {
  iframe.src = iframe.getAttribute(`data-src`)
  iframe.removeAttribute(`data-src`)
}

module.exports = bind
