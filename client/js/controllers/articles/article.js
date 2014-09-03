'use strict';

var $ = require('dominus');
var raf = require('raf');
var throttle = require('lodash.throttle');
var storage = require('../../lib/storage');
var convertToPonyEditor = require('../../lib/convertToPonyEditor');
var key = 'comment-draft';

module.exports = function (viewModel, route) {
  var container = $('.mc-container');
  var name = $('.mc-name');
  var email = $('.mc-email');
  var site = $('.mc-site');
  var content = $.findOne('.mc-content');
  var preview = $.findOne('.mc-preview');
  var send = $('.mc-send');
  var serializeSlowly = throttle(serialize, 200);
  var pony = convertToPonyEditor(content, preview);
  var body = $('.pmk-input', content);

  container.on('keypress keydown keyup paste', serializeSlowly);
  send.on('click', comment);

  deserialize();

  function deserialize () {
    var data = storage.get(key) || {};
    name.value(data.name);
    email.value(data.email);
    site.value(data.site);
    body.value(data.content);
    pony.refresh();
  }

  function serialize () { storage.set(key, getCommentData()); }

  function getCommentData () {
    return {
      name: name.value(),
      email: email.value(),
      site: site.value(),
      content: body.value()
    };
  }

  function clear () {
    body.value('');
    serialize();
    raf(deserialize);
  }

  function comment () {
    var endpoint = '/api/articles/' + viewModel.article.slug + '/comment';
    var model = {
      json: getCommentData()
    };
    viewModel.measly.put(endpoint, model).on('data', clear);
  }
};
