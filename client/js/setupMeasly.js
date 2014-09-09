'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var measly = require('measly');

function setupMeasly () {
  taunus.on('render', function (container, viewModel) {
    viewModel.measly = measly.layer({ context: container });
  });

  measly.on('data', clean);
  measly.on(200, render);
  measly.on(400, render);
  measly.on(404, render);
}

function clean () {
  $(this.context).find('.vw-conventional').remove();
}

function render (err, body) {
  if (!body.messages) {
    return;
  }
  var context = $(this.context);
  var messages = $('<ul>').addClass('vw-conventional');

  $(body.messages.map(dom)).appendTo(messages);

  context.find('.vw-conventional').remove();

  var title = context.find('.vw-title');
  if (title.length) {
    title.after(messages);
  } else {
    context.prepend(messages);
  }

  messages[0].scrollIntoView();

  global.scrollBy(0, -100);
}

function dom (message) {
  return $('<li>').text(message).addClass('vw-conventional-message')[0];
}

module.exports = setupMeasly;
