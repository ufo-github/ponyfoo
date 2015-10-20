'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var measly = require('measly');

function subscriptions () {
  taunus.on('render', render);
}

function render (container) {
  var places = $('.ss-container', container);
  var ajax = measly.layer({ context: places[0] });
  var source = $('.ss-source', places).value();
  var input = $('.ss-input', places);
  var button = $('.ss-button', places);
  button.on('click', search);

  function search (e) {
    e.preventDefault();
    var email = input.value().trim();
    if (email) {
      ajax.put('/api/subscribers', {
        json: { subscriber: email, source: source }
      });
    }
  }
}

module.exports = subscriptions;
