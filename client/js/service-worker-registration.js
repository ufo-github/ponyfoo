'use strict'

const taunus = require(`taunus`)
const taunusView = require(`taunus/browser/view`)
const taunusClone = require(`taunus/browser/clone`)
const swivel = require(`swivel`)
const sw = require(`./lib/sw`)

function register () {
  const enabled = `serviceWorker` in navigator
  if (!enabled) {
    return
  }
  navigator.serviceWorker
    .register(`/service-worker.js`)
    .then(navigator.serviceWorker.ready)
    .then(setupMessaging)

  function setupMessaging () {
    swivel.on(`view-update`, renderUpdate)

    function renderUpdate (context, href, data) {
      if (sw.toggleJSON(href, false) !== location.href) {
        return
      }
      const state = taunus.state
      const model = data.model
      if (JSON.stringify(model) !== JSON.stringify(state.model)) {
        state.model = taunusClone(model)
        taunusView(state.container, null, state.model, state.route)
      }
    }
  }
}

module.exports = register
