'use strict';

var $ = require('dominus');
var taunus = require('taunus');
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
  var bureaucrat = bureaucracy.setup(el, {
    endpoint: '/api/images',
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
    updateThumbnailImage();
  }

  function updateThumbnailImage () {
    var $container = $el.parents('.wa-section-contents');
    scrapeCompletionService.updateThumbnail($container);
  }
}

module.exports = bind;
