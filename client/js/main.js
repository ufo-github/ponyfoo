'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var moment = require('moment');
var raf = require('raf');
var markdownService = require('../../services/markdown');
var analytics = require('./analytics');
var wiring = require('./wiring');
var env = require('../../lib/env');
var main = $.findOne('.ly-main');
var g = global;

require('hint');

require('./conventions/search')();
require('./conventions/subscriptions')();
require('./conventions/codepen')();
require('./conventions/twitter')();
require('./conventions/ajaxLogoNavigation')();
require('./conventions/ajax')();
require('./conventions/loading')();
require('./conventions/unwrapFrames')();
require('./conventions/unwrapImages')();
require('./conventions/unwrapEmails')();
require('./conventions/linkifyHeadings')();
require('./conventions/relativeTime')();
require('./conventions/textareas')();
require('./conventions/konami')();
require('./conventions/carbon')();

taunus.mount(main, wiring, {
  version: env('APP_VERSION'),
  bootstrap: 'manual',
  forms: false
});

g.$ = $;
g.md = markdownService.compile;
g.md.svc = markdownService;
g.moment = moment;

require('./service-worker-registration')();

analytics(env('NODE_ENV'));
require('./welcome')(env('APP_VERSION'));
