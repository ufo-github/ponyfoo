'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var domador = require('domador');
var woofmark = require('woofmark');
var markdownService = require('../../../services/markdown');

function textareas () {
  taunus.gradual.transform(before);
  taunus.on('render', activate);
}

function activate (container, model) {
  $('form textarea', container).but('.pmk-input').forEach(convert);

  function convert (el) {
    var wel = $(el)
    var hasHtml = wel.hasClass('wk-html')
    var hasWysiwyg = wel.hasClass('wk-wysiwyg')
    var editor = woofmark(el, {
      parseMarkdown: domador,
      parseHTML: markdownService.decompile,
      classes: {
        wysiwyg: 'md-markdown',
        prompts: {
          dropicon: 'fa fa-upload'
        },
        dropicon: 'fa fa-upload'
      },
      render: {
        modes: renderModes,
        commands: renderCommands
      },
      images: {
        url: '/api/markdown/images',
        restriction: 'GIF, JPG, and PNG images'
      },
      xhr: xhr,
      html: hasHtml,
      wysiwyg: hasWysiwyg
    });

    taunus.track(el, editor);

    function xhr (options, done) {
      return taunus.xhr(options, response);
      function response (err, data, res) {
        if (err) {
          done(err); return;
        }
        if (taunus.versionCheck(data.version) === false) {
          return;
        }
        done(null, res, data);
      }
    }

    function renderModes (el, id) {
      var icons = {
        markdown: 'file-text-o',
        html: 'file-code-o',
        wysiwyg: 'eye'
      };
      renderIcon(el, icons[id] || id);
    }

    function renderCommands (el, id) {
      var icons = {
        quote: 'quote-right',
        ul: 'list-ul',
        ol: 'list-ol',
        heading: 'header',
        image: 'picture-o',
        attachment: 'paperclip'
      };
      renderIcon(el, icons[id] || id);
    }

    function renderIcon (el, icon) {
      $(el).addClass('wk-command-' + icon)
      $('<i>').addClass('fa fa-' + icon).appendTo(el);
    }
  }
}

function before (form) {
  var areas = $('textarea', form);
  var store = [];

  areas.forEach(replace);
  return after;

  function replace (el) {
    var input = $(el);
    store.push(input.value());
    input.value(woofmark(el).value());
  }
  function after (form) {
    areas.forEach(restore);
  }
  function restore (el, i) {
    $(el).value(store[i]);
  }
}

module.exports = textareas;
