'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var measly = require('measly');
var moment = require('moment');
var loading = require('./loading');
var defaultMessages = ['Oops. It seems something went terribly wrong!'];
var unwrapImages = require('../lib/unwrapImages');
var body = $('body');

body.on('click', '.vw-conventional, .fs-messages', remove);

function conventions () {
  measly.on('data', renderOrClean);
  measly.on('error', render);
  taunus.on('render', relativeTime);
  taunus.on('render', createLayer);
  taunus.on('render', unwrapImages);
  taunus.on('render', linkifyHeadings);
  taunus.on('start', unwrapImages.bind(null, body));
  taunus.on('fetch.error', handleTaunusError);

  taunus.on('fetch.start', loading.show);
  taunus.on('fetch.done', loading.hide);
  taunus.on('fetch.abort', loading.hide);
  taunus.on('fetch.error', loading.hide);
}

function linkifyHeadings (container) {
  $('.md-markdown', container)
    .find('h1,h2,h3,h4,h5,h6')
    .map(wrapInline)
    .find('.md-heading')
    .on('mouseenter', function (e) {
      $(e.target).parent().addClass('md-heading-hover')
    })
    .on('mouseleave', function (e) {
      $(e.target).parent().removeClass('md-heading-hover')
    })
    .on('click', changeHash)

  function wrapInline (el) {
    return $(el).html('<span class="md-heading">' + $(el).html() + '</span>')
  }

  function changeHash (e) {
    console.log(e.target)
    location.hash = $(e.target).parents('[id]').attr('id');
  }
}

function relativeTime (container) {
  $('.rt-relative', container).forEach(relative);
}

function relative (el) {
  var time = $(el);
  var absolute = moment(time.attr('datetime'));
  time.text(absolute.fromNow());
}

function createLayer (container, viewModel) {
  measly.abort();
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
  if (this.aborted) {
    return;
  }
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
    context.i(0).prepend(list);
  }

  list[0].scrollIntoView();

  global.scrollBy(0, -100);
}

function handleTaunusError (route, context, err) {
  var ctx = $(context.element);
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

module.exports = conventions;
