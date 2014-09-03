'use strict';

var $ = require('dominus');
var throttle = require('lodash.throttle');
var storage = require('../../lib/storage');
var convertToPonyEditor = require('../../lib/convertToPonyEditor');
var key = 'comment-draft';

module.exports = function (viewModel, route) {
  var name = $('.mc-name');
  var site = $('.mc-site');
  var email = $('.mc-email');
  var content = $.findOne('.mc-content');
  var preview = $.findOne('.mc-preview');
  var send = $('.mc-send');
  var serializeSlowly = throttle(serialize, 200);

  convertToPonyEditor(content, preview);

  var body = $('.pmk-input', content);

  // deserialize

  function serialize () { storage.set(key, getCommentData()); }

  function getCommentData () {
    return {
      name: name.value(),
      site: site.value(),
      email: email.value(),
      content: body.value()
    };
  }

  function comment () {
    body.value('');
    serialize();
  }
};
