'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var measly = require('measly');
var defaultMessages = ['Oops. It seems something went terribly wrong!'];
var unwrapImages = require('./lib/unwrapImages');

$('body').on('click touch', '.vw-conventional, .fs-messages', remove);

function setupMeasly () {
  measly.on('data', renderOrClean);
  measly.on('error', render);
  taunus.on('error', handleTaunusError);
  taunus.on('render', createLayer);
  taunus.on('render', unwrapImages);
}

function createLayer (container, viewModel) {
  viewModel.measly = measly.layer({ context: container });
}

function remove (e) {
  e.preventDefault();
  var ctx = $(e.target);
  var parents = ctx.parents('.vw-conventional, .fs-messages');
  ctx.and(parents).remove();
}

function clean (context) {
  context.find('.vw-conventional').remove();
}

function renderOrClean (data) {
  if (data.messages) {
    render.call(this, null, data); return;
  }
  var context = $(this.context);
  clean(context);
}

function getMessages (err, body) {
  return body && body.messages || !body && defaultMessages;
}

function render (err, body) {
  var messages = getMessages(err, body);
  if (messages === void 0) {
    return;
  }
  var context = $(this.context);
  var list = $('<ul>').addClass('vw-conventional');

  $(messages.map(dom)).appendTo(list);

  clean(context);

  var title = context.findOne('.vw-title');
  if (title) {
    $(title).after(list);
  } else {
    $(context[0]).prepend(list);
  }

  list[0].scrollIntoView();

  global.scrollBy(0, -100);
}

function handleTaunusError (err, origin) {
  if (!origin.context) {
    return;
  }
  var ctx = $(origin.context);
  var parents = ctx.parents('.ly-section');
  var section = ctx.where('.ly-section').and(parents);
  if (section.length) {
    render.call({ context: section.length ? section : document.body }, err, {
      messages: defaultMessages
    });
  }
}

function dom (message) {
  return $('<li>').text(message).addClass('vw-conventional-message')[0];
}

module.exports = setupMeasly;
