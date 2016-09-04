'use strict';

const $ = require(`dominus`);

module.exports = function (viewModel, container) {
  const toc = $(`.otoc-container`, container);
  const sections = $(`ol ol`, toc);

  $(`<a>`)
    .addClass(`lk-icon fa fa-plus otoc-toggle`)
    .beforeOf(sections);

  $(`.otoc-toggle`).on(`click`, toggleSection);

  function toggleSection (e) {
    const $target = $(e.target);
    const $ol = $target.next(`ol`);
    const isShown = $target.hasClass(`fa-plus`);
    showHide(isShown);

    function showHide (hide) {
      const on = hide ? `addClass` : `removeClass`;
      const off = hide ? `removeClass` : `addClass`;
      $target[off](`fa-plus`);
      $target[on](`fa-minus`);
      $ol[on](`otoc-show`);
    }
  }
};
