'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var rweb = /^https?:\/\//i;
var rprotocol = /^https?:\/\/(www\.)?/ig;
var swappers = [];

function noop () {}

function scrape (options, done) {
  if (ignore()) {
    return;
  }
  var $container = options.container;
  var updatePreview = options.updatePreview;
  var end = done || noop;
  var xhrOpts = {
    url: '/api/metadata/scrape?url=' + encodeURIComponent(options.url),
    json: true
  };
  taunus.xhr(xhrOpts, scraped);

  function ignore () {
    if (!options.source) {
      return;
    }
    var $el = $(options.source);
    var url = $el.value().trim();
    if (!rweb.test(url)) {
      return true;
    }
    var old = $el.attr('data-last-scraped');
    $el.attr('data-last-scraped', url);
    if (url.length === 0 || url === old) {
      return true;
    }
  }
  function scraped (err, data) {
    if (err) {
      end(err); return;
    }
    var firstImage = data.images && data.images[0] || '';
    var description = (data.description || '').trim();
    var sourceHref = 'https://twitter.com/' + (data.twitter ? data.twitter.slice(1) : '');
    var imageInput = $('.wa-link-image', $container);
    var imageInputContainer = $('.wa-link-image-container', $container);

    updateInputs();
    updateImageSwapper();
    updateThumbnail($container);
    updatePreview();
    end(null);

    function updateInputs () {
      $('.wa-link-title', $container).value(data.title || options.url.replace(rprotocol, ''));
      $('.wa-link-description', $container).value(description);
      $('.wa-link-source', $container).value(data.source || '');
      $('.wa-link-source-href', $container).value(sourceHref);
      $('.wa-link-image', $container).value(firstImage);
      $('.wa-link-tags', $container).value('');
      $('.wa-link-tag', $container).value(false);
      $('.wa-link-sponsored', $container).value(false);
    }

    function updateImageSwapper () {
      var swapper = data.images.length > 1;
      if (swapper) {
        swapperOn();
      } else {
        swapperOff();
      }
    }

    function swapperOff () {
      var toggler = $('.wa-toggler', imageInputContainer);
      swapperOffEvent(toggler);
    }

    function swapperOn () {
      var toggler = $('.wa-toggler', imageInputContainer);
      var togglerLeft = $('.wa-link-image-left', imageInputContainer);
      var togglerRight = $('.wa-link-image-right', imageInputContainer);
      var index = 0;

      swapperOffEvent(toggler);
      togglerLeft.addClass('wa-toggler-off');
      togglerRight.removeClass('wa-toggler-off');

      swapperOnEvent(toggler, swap);

      function swap (e) {
        var $el = $(e.target);
        if ($el.hasClass('wa-toggler-off')) {
          return;
        }
        var left = e.target === togglerLeft[0];
        index += left ? -1 : 1;
        imageInput.value(data.images[index] || '');
        invalidate(-1, togglerLeft);
        invalidate(1, togglerRight);
        updateThumbnail($container);
        updatePreview();
      }

      function invalidate (offset, $el) {
        var on = typeof data.images[index + offset] === 'string';
        var op = on ? 'removeClass' : 'addClass';
        $el[op]('wa-toggler-off');
      }
    }

    function swapperOnEvent (toggler, swap) {
      toggler
        .removeClass('uv-hidden')
        .on('click', swap);
      swappers.push({ toggler: toggler, fn: swap });
    }

    function swapperOffEvent (toggler) {
      var swapper = findSwapper();
      toggler
        .addClass('uv-hidden')
        .off('click', swapper && swapper.fn);
      function findSwapper () {
        for (var i = 0; i < swappers.length; i++) {
          if ($(swappers[i].toggler).but(toggler).length === 0) {
            return swappers.splice(i, 1)[0];
          }
        }
      }
    }
  }
}

function updateThumbnail ($container) {
  var $image = $('.wa-link-image', $container);
  var $imagePreview = $('.wa-link-image-preview', $container);
  var imageValue = $image.value().trim();

  $imagePreview.attr('src', imageValue);

  if (imageValue.length) {
    $imagePreview.removeClass('uv-hidden');
  } else {
    $imagePreview.addClass('uv-hidden');
  }
}

module.exports = {
  scrape: scrape,
  updateThumbnail: updateThumbnail
};
