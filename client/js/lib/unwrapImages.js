'use strict'

const $ = require(`dominus`)

function unwrapImages (container) {
  $(container).find(`img[data-src]`).forEach(unwrap)
}

function unwrap (img) {
  const $img = $(img)
  if (!$img.attr(`data-src`)) {
    return
  }
  $img.attr(`src`, $img.attr(`data-src`))
  $img.attr(`data-src`, null)
  $img.on(`load`, loaded($img))
}

function loaded ($img) {
  $img
    .parents(`figure`)
    .addClass(`figure-has-loaded`)
}

module.exports = unwrapImages
