'use strict';

var $ = require('dominus');
var raf = require('raf');
var dragula = require('dragula');
var taunus = require('taunus');
var debounce = require('lodash/function/debounce');
var markdownService = require('../../../../../services/markdown');

module.exports = function (viewModel, container) {
  var editor = $.findOne('.wa-editor', container);
  var toolbox = $.findOne('.wa-toolbox', container);
  var drakeTools = dragula([editor, toolbox], {
    moves: function (el, source) {
      return source === toolbox;
    },
    copy: true
  });
  var drakeSort = dragula([editor]);

  $(document.documentElement).on('keyup', cancellations);
  $(editor).on('click', '.wa-section-remove', removeSection);
  $(editor).on('click', '.wa-section-toggle', toggleSection);
  drakeTools.on('cloned', clonedTool);
  drakeTools.on('drop', droppedTool);

  function removeSection (e) {
    $(e.target).parents('.wa-section').remove();
  }
  function toggleSection (e) {
    var toggler = $(e.target);
    var content = toggler.parents('.wa-section').find('.wa-section-contents');
    if (content.hasClass('uv-hidden')) {
      content.removeClass('uv-hidden');
      toggler.removeClass('fa-expand');
      toggler.addClass('fa-compress');
    } else {
      content.addClass('uv-hidden');
      toggler.addClass('fa-expand');
      toggler.removeClass('fa-compress');
    }
  }
  function clonedTool (clone) {
    $(clone).addClass('wa-section-header');
  }
  function droppedTool (el,a,b,c) {
    var tool = $(el);
    var toolName = tool.attr('data-tool');
    var action = 'author/weeklies/tool-' + toolName;
    taunus.partial.replace(el, action, {});
  }
  function cancellations (e) {
    if (e.which === 27) {
      drakeTools.cancel(true);
      drakeSort.cancel(true);
    }
  }
};
