'use strict';

var $ = require('dominus');
var jade = require('jade/runtime');
var ponymark = require('ponymark');
var taunus = require('taunus');
var moment = require('moment');
var measly = require('measly');

global.$ = $; // merely for debugging convenience
global.jade = jade; // let jade have it their way
global.moment = moment; // let rome use our moment instance

var wiring = require('./wiring');
var main = $.findOne('.ly-main');

ponymark.configure({
  imageUploads: '/api/markdown/images'
});

taunus.on('render', function (container, viewModel) {
  viewModel.measly = measly.layer({ context: container });
});
taunus.mount(main, wiring);

measly.on(400, function (err, body) {
  throw new Error('TODO: implement this API on dominus!');
  var container = 'vw-validation';
  var context = $(this.context);
  var messages = $('<div/>').addClass(container);

  body.messages.map(dom).appendTo(messages);
  context.find(container).remove().prepend(messages);

  function dom (message) {
    return $('<p/>').text(message).addClass('vw-validation-message');
  }
});
