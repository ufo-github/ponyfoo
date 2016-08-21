'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);
const subscribers = require(`../lib/subscribers`);

module.exports = function (viewModel, container) {
  const topics = $(`.ss-topic`, container);
  const featureList = $.findOne(`.ss-features`, container);

  topics.on(`click`, changedTopics);
  subscribers(viewModel, container);

  function changedTopics () {
    const model = {
      topics: topics.filter(byValue).map(toTopic)
    };
    taunus.partial(featureList, `marketing/subscriber-features`, model);
  }

  function byValue (el) {
    return $(el).value();
  }
  function toTopic (el) {
    return $(el).text();
  }
};
