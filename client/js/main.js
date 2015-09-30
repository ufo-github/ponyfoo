'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var moment = require('moment');
var markdownService = require('../../services/markdown');
var subscriptions = require('./subscriptions');
var analytics = require('./analytics');
var wiring = require('./wiring');
var main = $.findOne('.ly-main');
var g = global;

require('hint');

require('./conventions/codepen')();
require('./conventions/twitter')();
require('./conventions/ajax')();
require('./conventions/loading')();
require('./conventions/unwrapImages')();
require('./conventions/linkifyHeadings')();
require('./conventions/relativeTime')();
require('./conventions/textareas')();
require('./conventions/konami')();
require('./conventions/carbon')();

taunus.on('start', starting);
taunus.mount(main, wiring, { bootstrap: 'inline', forms: false });

g.$ = $;
g.md = markdownService.compile;
g.moment = moment;

function starting (container, viewModel) {
  require('./search');
  subscriptions($('.de-subscribe'));
  analytics(viewModel.env);
  require('./welcome')(viewModel);
}
