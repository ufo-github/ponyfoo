'use strict'

const $ = require(`dominus`)
const taunus = require(`taunus`)
const loadScript = require(`../lib/loadScript`)
const placement = `https://cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=ponyfoocom`
const options = {
  container: $.findOne(`.ca-content`),
  id: `_carbonads_js`
}
const script = loadScript(placement, options, loaded)
let timer
let originalGo

function loaded () {
  timer = setTimeout(helpMePay, 5000)
  originalGo = global._carbonads_go
  global._carbonads_go = go
}

function go (data) {
  patch(data)
  originalGo(data)
  $(`#_carbonads_js ~ [id^=carbonads_]`).remove() // remove extra ads if carbon is being weird
}

function patch (data) {
  if (data.ads) {
    data.ads.forEach(patchAd)
  }
  function patchAd (ad) { // fix unsafe image loading for hosts known to support https
    try {
      ad.image = patchUnsafeImageHost(ad.image)
    } catch (e) {
      // suppress
    }
  }
}

function patchUnsafeImageHost (image) {
  if (image.indexOf(`//`) === 0) {
    return `https:` + image
  }
  const url = new URL(image)
  if (url.host === `assets.servedby-buysellads.com` && url.protocol === `http:`) {
    return url.href.replace(/^http:/, `https:`)
  }
  return image
}

function carbon () {
  taunus.once(`change`, track)
}

function track () {
  taunus.on(`change`, changed)
}

function changed () {
  options.container = $.findOne(`.ca-content`, taunus.state.container)
  if (timer) {
    clearTimeout(timer)
  }
  if (!options.container) {
    return
  }
  if (global._carbonads) {
    options.container.appendChild(script)
    global._carbonads.reload()
  }
  timer = setTimeout(helpMePay, 5000)
}

function helpMePay () {
  const blocked = $(`#carbonads`).length === 0
  if (blocked) {
    $(`.ca-blocked`).removeClass(`uv-hidden`)
  } else {
    $(`.ca-blocked`).addClass(`uv-hidden`)
  }
  timer = false
}

module.exports = carbon
