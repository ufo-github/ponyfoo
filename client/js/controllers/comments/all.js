'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus');
var debounce = require('lodash/function/debounce');
var storage = require('../../lib/storage');
var textService = require('../../../../services/text');
var key = 'comment-draft';

module.exports = function (viewModel, container) {
  var composer = $('.mc-composer', container);
  var name = $('.mc-name', container);
  var email = $('.mc-email', container);
  var site = $('.mc-site', container);
  var content = $('.mc-content', container);
  var preview = $.findOne('.mc-preview', container);
  var send = $('.mc-send', container);
  var sendText = $('.bt-text', send);
  var serializeSlowly = debounce(serialize, 100);
  var comments = $('.mm-comments', container);
  var cancelReply = $('.mc-cancel-reply', container);
  var footer = $('.mm-footer', container);
  var gravatars = $('.mm-gravatar', container);
console.log(comments)
  $('.mm-thread-reply', container).removeClass('uv-hidden');

  composer.on('keypress keydown keyup paste input', serializeSlowly);
  send.on('click', comment);
  comments.on('click', '.mm-thread-reply', attach);
  comments.on('click', '.mm-remove', remove);
  cancelReply.on('click', detach);
  deserialize();

  function deserialize () {
    var data = storage.get(key);
    if (data) {
      name.value(data.name);
      email.value(data.email);
      site.value(data.site);
    }
  }

  function serialize () { storage.set(key, getCommentData()); }

  function getCommentData () {
    return {
      name: name.value(),
      email: email.value(),
      site: site.value(),
      content: content.value()
    };
  }

  function attach (e) {
    var button = $(e.target);
    var thread = button.parents('.mm-thread');
    var reply = thread.find('.mm-thread-reply');
    var replies = $('.mm-thread-reply').but(reply);
    replies.removeClass('uv-hidden');
    reply.addClass('uv-hidden').parent().before(composer);
    sendText.text('Add Reply');
    cancelReply.removeClass('uv-hidden');
    composer.find('.vw-conventional').remove();
  }

  function detach () {
    var replies = $('.mm-thread-reply');
    footer.append(composer);
    replies.removeClass('uv-hidden');
    cancelReply.addClass('uv-hidden');
    sendText.text('Add Comment');
    composer.find('.vw-conventional').remove();
  }

  function comment (e) {
    e.preventDefault();

    var thread = send.parents('.mm-thread');
    var endpoint = textService.format('/api/%s/%s/comments', viewModel.parentType, viewModel.parent.slug);
    var model = {
      json: getCommentData()
    };
    model.json.parent = thread.attr('data-thread');
    viewModel.measly.put(endpoint, model).on('data', commented);

    function commented (data) {
      content.value('');
      detach();
      serialize();
      raf(deserialize);
      appendResult(data);
    }

    function appendResult (data) {
      var placeholder = $('<div>');
      var template, partial;
      var model = {
        user: viewModel.user,
        parent: {
          author: viewModel.parent.author,
          commentThreads: [{
            comments: [data],
            id: data._id
          }]
        }
      };
      if (thread.length) {
        model.comment = data;
        template = 'comments/comment';
      } else {
        template = 'comments/thread';
      }
      taunus.partial(placeholder[0], template, model);
      partial = placeholder.children();
      partial.find('.mm-thread-reply').removeClass('uv-hidden');
      if (thread.length) {
        thread.find('.mm-thread-comments').append(partial);
      } else {
        comments.find('.mm-footer').before(partial);
      }
    }
  }

  function remove (e) {
    var button = $(e.target);
    var comment = button.parents('.mm-comment');
    var id = comment.attr('data-comment');
    var endpoint = textService.format('/api/%s/%s/comments/%s', viewModel.parentType, viewModel.parent.slug, id);

    viewModel.measly.delete(endpoint).on('data', cleanup);

    function cleanup () {
      var comments = $(textService.format('[data-comment="%s"]', id));
      var thread = $(textService.format('[data-thread="%s"]', id));
      if (thread.length && composer.parents(thread).length) {
        detach();
      }
      thread.and(comments).remove();
    }
  }
};
