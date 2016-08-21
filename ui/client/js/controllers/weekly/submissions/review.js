'use strict';

const $ = require(`dominus`);

module.exports = function (viewModel, container) {
  const table = $(`.wur-container`, container);

  table.on(`click`, `.wur-remove`, remove);

  function remove (e) {
    const target = $(e.target);
    const slug = target.attr(`data-slug`);
    const confirmation = confirm(`About to delete /weekly/submissions/` + slug + `, are you sure?`);
    if (!confirmation) {
      return;
    }
    const endpoint = `/api/weeklies/submissions/` + slug;

    viewModel.measly.delete(endpoint).on(`data`, removeRow);

    function removeRow () {
      target.parents(`tr`).remove();
    }
  }
};
