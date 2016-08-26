'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);
const measly = require(`measly`);
const progressblock = require(`../lib/progressblock`);

function subscriptions () {
  taunus.on(`render`, render);
}

function render (container) {
  $(`.ss-container`, container).forEach(setupInPlace);

  function setupInPlace (place) {
    const ajax = measly.layer({ context: place });
    const source = $(`.ss-source`, place).value();
    const input = $(`.ss-input`, place);
    const topicChecks = $(`.ss-topic`, place);
    const button = $(`.ss-button`, place);
    button.on(`click`, submit);

    function submit (e) {
      e.preventDefault();
      if (progressblock.block(button)) {
        return;
      }
      const email = input.value().trim();
      if (!email) {
        return;
      }
      const json = {
        subscriber: email,
        source: source,
        topics: topicChecks.length ? topicChecks.filter(byValue).map(toTopic) : undefined
      };
      ajax
        .put(`/api/subscribers`, { json })
        .on(`data`, () => progressblock.release(button));
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
