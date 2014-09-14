'use strict';

var $ = require('dominus');
var measly = require('measly');
var taunus = require('taunus');
var container = $('.ss-container');
var input = $('.ss-input');
var button = $('.ss-button');
var ajax = measly.layer({ context: container });

button.on('click', search);

function search () {
  var email = input.value().trim();
  if (email) {
    ajax.put('/api/subscribers', {
      json: { email: email }
    });
  }
}
