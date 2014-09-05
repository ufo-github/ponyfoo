'use strict';

var $ = require('dominus');
var raf = require('raf');
var throttle = require('lodash.throttle');
var storage = require('../../lib/storage');
var convertToPonyEditor = require('../../lib/convertToPonyEditor');
var key = 'comment-draft';

module.exports = function (viewModel) {
  var composer = $('.mc-composer');
  var name = $('.mc-name');
  var email = $('.mc-email');
  var site = $('.mc-site');
  var content = $.findOne('.mc-content');
  var preview = $.findOne('.mc-preview');
  var send = $('.mc-send');
  var serializeSlowly = throttle(serialize, 200);
  var pony = convertToPonyEditor(content, preview);
  var body = $('.pmk-input', content);
  var comments = $('.mm-comments');
  var cancelReply = $('.mc-cancel-reply');
  var footer = $('.mm-footer');

  composer.on('keypress keydown keyup paste', serializeSlowly);
  send.on('click', comment);
  comments.on('click', '.mm-thread-reply', attach);
  cancelReply.on('click', detach);
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

  function attach (e) {
    var button = $(e.target);
    var thread = button.parents('.mm-thread');
    var reply = thread.find('.mm-thread-reply');
    var replies = $('.mm-thread-reply').but(reply);
    thread.append(composer);
    replies.removeClass('uv-hidden');
    reply.addClass('uv-hidden');
    cancelReply.removeClass('uv-hidden');
  }

  function detach () {
    var replies = $('.mm-thread-reply');
    footer.append(composer);
    replies.removeClass('uv-hidden');
    cancelReply.addClass('uv-hidden');
  }

  function comment () {
    var endpoint = '/api/articles/' + viewModel.article.slug + '/comment';
    var model = {
      json: getCommentData()
    };
    model.json.parent = null;
    viewModel.measly.put(endpoint, model).on('data', clear);
  }
};
