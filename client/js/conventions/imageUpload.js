'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var queso = require('queso');
var bureaucracy = require('bureaucracy');
var scrapeCompletionService = require('../services/scrapeCompletion');
var body = $.findOne('body');

function bind () {
  taunus.on('start', setupUploads.bind(null, body));
  taunus.on('render', setupUploads);
}

function setupUploads (container) {
  $(container).find('.bx-fileinput').forEach(setup);
}

function setup (el) {
  var $el = $(el);
  var inputContainer = $el.parents('.bx-icon').prev('.bx-input');
  var input = inputContainer.find('input');
  var grayscale = input.attr('data-grayscale');
  var preserve = input.attr('data-preserve-size');
  var options = {};
  if (preserve) { options['preserve-size'] = true; }
  if (grayscale) { options.grayscale = true; }
  var bureaucrat = bureaucracy.setup(el, {
    endpoint: '/api/images' + queso.stringify(options),
    validator: 'image'
  });
  bureaucrat.on('started', loader());
  bureaucrat.on('ended', loader('done'));
  bureaucrat.on('success', uploaded);

  function loader (state) {
    return applyStateClass;
    function applyStateClass () {
      inputContainer[state === 'done' ? 'removeClass' : 'addClass']('bx-uploading');
    }
  }

  function uploaded (results) {
    if (results.length === 0) {
      return;
    }
    var result = results[0];
    input.value(result.href);
    input.emit('bureaucrat');
    updateThumbnailImage();
  }

  function updateThumbnailImage () {
    var $container = $el.parents('.wa-section-contents');
    scrapeCompletionService.updateThumbnail($container);
  }
}

module.exports = bind;
