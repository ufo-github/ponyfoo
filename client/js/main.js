'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);
const moment = require(`moment`);
const markdownService = require(`../../services/markdown`);
const analytics = require(`./analytics`);
const wiring = require(`./wiring`);
const env = require(`../../lib/env`);
const main = $.findOne(`.ly-main`);
const g = global;

require(`hint`);

require(`./conventions/search`)();
require(`./conventions/subscriptions`)();
require(`./conventions/codepen`)();
require(`./conventions/twitter`)();
require(`./conventions/ajaxLogoNavigation`)();
require(`./conventions/ajax`)();
require(`./conventions/loading`)();
require(`./conventions/unwrapFrames`)();
require(`./conventions/unwrapImages`)();
require(`./conventions/unwrapEmails`)();
require(`./conventions/linkifyHeadings`)();
require(`./conventions/relativeTime`)();
require(`./conventions/textareas`)();
require(`./conventions/imageUpload`)();
require(`./conventions/konami`)();
require(`./conventions/carbon`)();
require(`./conventions/scroll`)();

taunus.mount(main, wiring, {
  version: env(`APP_VERSION`),
  bootstrap: `manual`,
  forms: false
});

g.$ = $;
g.md = markdownService.compile;
g.md.svc = markdownService;
g.moment = moment;

require(`./service-worker-registration`)();

analytics(env(`NODE_ENV`));
require(`./welcome`)(env(`APP_VERSION`));
