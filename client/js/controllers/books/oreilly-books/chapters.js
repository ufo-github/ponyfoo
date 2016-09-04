'use strict';

const $ = require(`dominus`);

module.exports = function (viewModel, container) {
  const depth = $(`.otoc-depth`, container);
  const toc = $(`.otoc-container`, container);

  depth.on(`change`, updateVisibleToc);
  updateVisibleToc();

  function updateVisibleToc () {
    const level = depth.where(`:checked`).text();

    toc
      .removeClass(`otoc-depth-none otoc-depth-single otoc-depth-double`)
      .addClass(`otoc-depth-${level}`);
  }
};
