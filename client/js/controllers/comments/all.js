'use strict';

const $ = require('dominus');
const raf = require('raf');
const taunus = require('taunus');
const debounce = require('lodash/debounce');
const ls = require('../../lib/storage');
const userService = require('../../services/user');
const textService = require('../../../../services/text');
const key = 'comment-draft';

module.exports = function (viewModel, container) {
  const composer = $('.mc-composer', container);
  const name = $('.mc-name', container);
  const email = $('.mc-email', container);
  const site = $('.mc-site', container);
  const content = $('.mc-content', container);
  const send = $('.mc-send', container);
  const sendText = $('.bt-text', send);
  const serializeSlowly = debounce(serialize, 100);
  const comments = $('.mm-comments', container);
  const cancelReply = $('.mc-cancel-reply', container);
  const footer = $('.mm-footer', container);

  $('.mm-thread-reply', container).removeClass('uv-hidden');

  composer.on('keypress keydown keyup paste input', serializeSlowly);
  send.on('click', comment);
  comments.on('click', '.mm-thread-reply', attach);
  comments.on('click', '.mm-remove', remove);
  cancelReply.on('click', detach);
  deserialize();

  function deserialize () {
    const data = ls.get(key);
    if (data) {
      name.value(data.name);
      email.value(data.email);
      site.value(data.site);
    }
  }

  function serialize () { ls.set(key, getCommentData()); }

  function getCommentData () {
    return {
      name: name.value(),
      email: email.value(),
      site: site.value(),
      content: content.value()
    };
  }

  function attach (e) {
    const button = $(e.target);
    const thread = button.parents('.mm-thread');
    const reply = thread.find('.mm-thread-reply');
    const replies = $('.mm-thread-reply').but(reply);
    replies.removeClass('uv-hidden');
    reply.addClass('uv-hidden').parent().before(composer);
    sendText.text('Add Reply');
    cancelReply.removeClass('uv-hidden');
    composer.find('.vw-conventional').remove();
  }

  function detach () {
    const replies = $('.mm-thread-reply');
    footer.append(composer);
    replies.removeClass('uv-hidden');
    cancelReply.addClass('uv-hidden');
    sendText.text('Add Comment');
    composer.find('.vw-conventional').remove();
  }

  function comment (e) {
    e.preventDefault();

    const thread = send.parents('.mm-thread');
    const endpoint = textService.format('/api/%s/%s/comments', viewModel.parentType, viewModel.parent.slug);
    const model = {
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
      const placeholder = $('<div>');
      let template, partial;
      const model = {
        user: viewModel.user,
        roles: userService.getRoles(),
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
    const button = $(e.target);
    const comment = button.parents('.mm-comment');
    const id = comment.attr('data-comment');
    const endpoint = textService.format('/api/%s/%s/comments/%s', viewModel.parentType, viewModel.parent.slug, id);

    viewModel.measly.delete(endpoint).on('data', cleanup);

    function cleanup () {
      const comments = $(textService.format('[data-comment="%s"]', id));
      const thread = $(textService.format('[data-thread="%s"]', id));
      if (thread.length && composer.parents(thread).length) {
        detach();
      }
      thread.and(comments).remove();
    }
  }
};
