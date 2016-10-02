'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const taunus = require(`taunus`);
const debounce = require(`lodash/debounce`);
const ls = require(`local-storage`);
const addToHome = require(`../../components/addToHome`);
const progressblock = require(`../../lib/progressblock`);
const userService = require(`../../services/user`);
const key = `comment-draft`;

module.exports = function (viewModel, $container) {
  const $composer = $(`.mc-composer`, $container);
  const $name = $(`.mc-name`, $container);
  const $email = $(`.mc-email`, $container);
  const $website = $(`.mc-website`, $container);
  const $content = $(`.mc-content`, $container);
  const $send = $(`.mc-send`, $container);
  const $sendText = $(`.bt-text`, $send);
  const $comments = $(`.mm-comments`, $container);
  const $cancelReply = $(`.mc-cancel-reply`, $container);
  const $footer = $(`.mm-footer`, $container);
  const serializeSlowly = debounce(serialize, 100);

  $(`.mm-thread-reply`, $container).removeClass(`uv-hidden`);

  $composer.on(`keypress keydown keyup paste input`, serializeSlowly);
  $send.on(`click`, postComment);
  $comments.on(`click`, `.mm-thread-reply`, attach);
  $comments.on(`click`, `.mm-remove`, remove);
  $cancelReply.on(`click`, detach);
  deserialize();

  function deserialize () {
    const data = ls.get(key);
    if (data) {
      const { name = ``, email = ``, website = data.site || `` } = data;
      $name.value(name);
      $email.value(email);
      $website.value(website);
    }
  }

  function serialize () { ls.set(key, getCommentData()); }

  function getCommentData () {
    return {
      name: $name.value(),
      email: $email.value(),
      website: $website.value(),
      content: $content.value()
    };
  }

  function attach (e) {
    const $button = $(e.target);
    const $thread = $button.parents(`.mm-thread`);
    const $reply = $thread.find(`.mm-thread-reply`);
    const $replies = $(`.mm-thread-reply`).but($reply);
    $replies.removeClass(`uv-hidden`);
    $reply.addClass(`uv-hidden`).parent().before($composer);
    $sendText.text(`Add Reply`);
    $cancelReply.removeClass(`uv-hidden`);
    $composer.find(`.vw-conventional`).remove();
  }

  function detach () {
    const $replies = $(`.mm-thread-reply`);
    $footer.append($composer);
    $replies.removeClass(`uv-hidden`);
    $cancelReply.addClass(`uv-hidden`);
    $sendText.text(`Add Comment`);
    $composer.find(`.vw-conventional`).remove();
  }

  function postComment (e) {
    e.preventDefault();
    if (progressblock.block($send)) {
      return;
    }
    const $thread = $send.parents(`.mm-thread`);
    const endpoint = `/api/${viewModel.parentType}/${viewModel.parent.slug}/comments`;
    const model = {
      json: getCommentData()
    };
    model.json.parent = $thread.attr(`data-thread`);
    viewModel.measly.put(endpoint, model).on(`data`, commented);

    function commented (data) {
      progressblock.release($send);
      if (data.messages && data.messages.length) {
        return;
      }
      $content.value(``);
      detach();
      serialize();
      raf(deserialize);
      appendResult(data);
      addToHome.enable();
    }

    function appendResult (data) {
      const $placeholder = $(`<div>`);
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
      const template = $thread.length ? `comments/comment` : `comments/thread`;

      if ($thread.length) {
        model.comment = data;
      }

      taunus.partial($placeholder[0], template, model);

      const $partial = $placeholder.children();

      $partial.find(`.mm-thread-reply`).removeClass(`uv-hidden`);

      if ($thread.length) {
        $thread.find(`.mm-thread-comments`).append($partial);
      } else {
        $comments.find(`.mm-footer`).before($partial);
      }
    }
  }

  function remove (e) {
    const button = $(e.target);
    const comment = button.parents(`.mm-comment`);
    const id = comment.attr(`data-comment`);
    const endpoint = `/api/${viewModel.parentType}/${viewModel.parent.slug}/comments/${id}`;

    viewModel.measly.delete(endpoint).on(`data`, cleanup);

    function cleanup () {
      const $comments = $(`[data-comment="${id}"]`, $container);
      const $thread = $(`[data-thread="${id}"]`, $container);
      if ($thread.length && $composer.parents($thread).length) {
        detach();
      }
      $thread.and($comments).remove();
    }
  }
};
