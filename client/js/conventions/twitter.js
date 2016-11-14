'use strict'

const taunus = require(`taunus`)

function updateView (elem) {
  const twitter = global.twttr
  if (twitter && twitter.widgets) {
    twitter.widgets.load(elem)
  }
}

function twitter () {
  taunus.on(`start`, updateView.bind(null, document.body))
  taunus.on(`render`, updateView)
}

twitter.updateView = updateView

module.exports = twitter
