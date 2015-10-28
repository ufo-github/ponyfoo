'use strict';

var taunus = require('taunus');
var taunusView = require('taunus/browser/view');
var taunusClone = require('taunus/browser/clone');
var swivel = require('swivel');
var sw = require('./lib/sw');

function register () {
  var enabled = 'serviceWorker' in navigator;
  if (!enabled) {
    return;
  }
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(navigator.serviceWorker.ready)
    .then(setupMessaging);

  function setupMessaging () {
    swivel.on('view-update', renderUpdate);

    function renderUpdate (context, href, data) {
      if (sw.toggleJSON(href, false) === location.href) {
        refreshJSON();
      }
      function refreshJSON () {
        var state = taunus.state;
        var model = data.model;
        if (JSON.stringify(model) !== JSON.stringify(state.model)) {
          state.model = taunusClone(model);
          taunusView(state.container, null, state.model, state.route);
        }
      }
    }
  }
}

module.exports = register;
