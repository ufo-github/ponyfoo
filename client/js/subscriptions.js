'use strict';

var $ = require('dominus');
var measly = require('measly');

function bind (container) {
  var ajax = measly.layer({ context: container[0] });
  var input = $('.ss-input', container);
  var button = $('.ss-button', container);
  button.on('click', search);

  function search (e) {
    e.preventDefault();
    var email = input.value().trim();
    if (email) {
      ajax.put('/api/subscribers', {
        json: { subscriber: email }
      });
    }
  }
}

module.exports = bind;
