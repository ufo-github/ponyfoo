'use strict';

const $ = require(`dominus`);
const scroll = require(`../lib/scroll`);

function init () {
  scroll.track(({ scrolled }) => {
    const negated = 100 - scrolled;
    const visible = scrolled > 6;
    const show = visible ? `removeClass` : `addClass`;
    $(`.sp-line-wrapper`)[show](`uv-hidden`);
    $(`.sp-line`).css(`width`, negated + `%`);
  });
}

module.exports = init;
