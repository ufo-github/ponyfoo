'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var measly = require('measly');

function subscriptions () {
  taunus.on('render', render);
}

function render (container) {
  $('.ss-container', container).forEach(setupInPlace);

  function setupInPlace (place) {
    var ajax = measly.layer({ context: place });
    var source = $('.ss-source', place).value();
    var input = $('.ss-input', place);
    var topicChecks = $('.ss-topic', place);
    var button = $('.ss-button', place);
    button.on('click', search);

    function search (e) {
      e.preventDefault();
      var email = input.value().trim();
      if (!email) {
        return;
      }
      var json = {
        subscriber: email,
        source: source,
        topics: topicChecks.length ? topicChecks.filter(byValue).map(toTopic) : undefined
      };
      ajax.put('/api/subscribers', { json: json });
    }
  }

  function byValue (el) {
    return $(el).value();
  }
  function toTopic (el) {
    return $(el).text();
  }
}

module.exports = subscriptions;
