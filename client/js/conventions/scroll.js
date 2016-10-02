'use strict';

const $ = require(`dominus`);
const scroll = require(`../lib/scroll`);

function init () {
  scroll.track(({ scrolled, distances }) => {
    if (distances.length === 1 && distances[0].element === document.body) {
      set(); return;
    }
    const visibility = scrolled > 6;
    const width = 100 - scrolled;
    set({ visibility, width });
  });
}

function set ({ visibility = false, width = 0 } = {}) {
  const show = visibility ? `removeClass` : `addClass`;
  $(`.sp-line-wrapper`)[show](`uv-hidden`);
  $(`.sp-line`).css(`width`, width + `%`);
}

module.exports = init;
