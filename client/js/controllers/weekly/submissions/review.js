'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const taunus = require(`taunus`);
const debounce = require(`lodash/debounce`);
const loadScript = require(`../../../lib/loadScript`);
const scrapeCompletionService = require(`../../../services/scrapeCompletion`);
const weeklySubmissionPreviewService = require(`../../../services/weeklySubmissionPreview`);

module.exports = controller;

function controller (...params) {
  loadScript(`/js/weekly-compiler.js`, () => ready(...params));
}

function ready (viewModel, container) {
  const weeklyCompilerService = global.weeklyCompiler;
  const table = $(`.wur-container`, container);

  table.on(`click`, `.wur-remove`, remove);
  table.on(`click`, `.wur-share`, startShare);

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

  function startShare (e) {
    const $target = $(e.target);
    const $row = $target.parents(`tr`);
    if ($row.next(`.wurs-wrapper`).length) {
      return;
    }
    const slug = $target.attr(`data-slug`);
    viewModel.measly
      .get(`/api/weeklies/submissions/${slug}`)
      .on(`data`, data => render($target, data));
  }

  function render ($target, data) {
    const $row = $target.parents(`tr`);
    const colspan = $row.find(`td`).length;
    const $inputRow = $(`<tr>`).addClass(`wurs-wrapper`);
    const $inputCell = $(`<td>`).attr(`colspan`, colspan);
    const [inputCell] = $inputCell;
    const { section } = data;
    const model = {
      section,
      knownTags: viewModel.knownTags
    };

    $inputRow.append($inputCell).afterOf($row);
    taunus
      .partial(inputCell, `weekly/submissions/review-share`, model)
      .on(`render`, () => initializeShare({ $target, $inputRow, data }));
  }

  function initializeShare ({ $target, $inputRow, data }) {
    const container = $(`.wurs-container`, container);
    const previewHtml = $(`.wurs-preview`, container);
    const updatePreview = weeklySubmissionPreviewService.getUpdatePreview(previewHtml, {
      weeklyCompilerService,
      inputContainer: container,
      getSectionModelInfo
    });

    const updatePreviewSlowly = raf.bind(null, debounce(updatePreview, 100));

    $(`.wa-section-header`, $inputRow).remove();
    $(`.wa-link-href, .wa-link-subtype`, $inputRow).addClass(`uv-hidden`);
    $(`.wa-section-contents`, $inputRow).removeClass(`uv-hidden`);
    $(`.wurs-cancel`, $inputRow).on(`click`, remove);
    $(`.wurs-submit`, $inputRow).on(`click`, enqueueInWeekly);

    container
      .on(`click`, `.wa-link-toggle-tags`, weeklySubmissionPreviewService.toggleTags)
      .on(`change keypress keydown paste input bureaucrat`, `.wa-link-image`, updateThumbnailImage)
      .on(`change keypress keydown paste input`, `input,textarea,select`, updatePreviewSlowly);

    scrapeCompletionService.setup({ container, updatePreview });

    function remove () {
      $inputRow.remove();
    }
    function updateThumbnailImage (e) {
      const $container = $(e.target).parents(`.wa-section-contents`);
      scrapeCompletionService.updateThumbnail($container);
    }
    function getSectionModelInfo () {
      return data.section;
    }
    function getSectionModel () {
      return weeklySubmissionPreviewService.getSectionModel(container, getSectionModelInfo());
    }
    function enqueueInWeekly () {
      const slug = $target.attr(`data-slug`);
      const section = getSectionModel();
      const model = {
        json: {
          section
        }
      };
      viewModel.measly
        .post(`/api/weeklies/submissions/${slug}/push`, model)
        .on(`data`, remove);
    }
  }
}
