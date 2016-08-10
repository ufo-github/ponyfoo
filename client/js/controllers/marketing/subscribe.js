'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var subscribers = require('../lib/subscribers');

module.exports = function (viewModel, container) {
  var topics = $('.ss-topic', container);
  var featureList = $.findOne('.ss-features', container);

  topics.on('click', changedTopics);
  subscribers(viewModel, container);

  function changedTopics () {
    var model = {
      topics: topics.filter(byValue).map(toTopic)
    };
    taunus.partial(featureList, 'marketing/subscriber-features', model);
  }

  function byValue (el) {
    return $(el).value();
  }
  function toTopic (el) {
    return $(el).text();
  }
};
