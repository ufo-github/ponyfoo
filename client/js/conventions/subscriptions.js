'use strict';

const $ = require('dominus');
const taunus = require('taunus');
const measly = require('measly');

function subscriptions () {
  taunus.on('render', render);
}

function render (container) {
  $('.ss-container', container).forEach(setupInPlace);

  function setupInPlace (place) {
    const ajax = measly.layer({ context: place });
    const source = $('.ss-source', place).value();
    const input = $('.ss-input', place);
    const topicChecks = $('.ss-topic', place);
    const button = $('.ss-button', place);
    button.on('click', search);

    function search (e) {
      e.preventDefault();
      const email = input.value().trim();
      if (!email) {
        return;
      }
      const json = {
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
