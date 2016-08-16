'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);
const rweb = /^https?:\/\//i;
const rprotocol = /^https?:\/\/(www\.)?/ig;
const swappers = [];

function noop () {}

function scrape (options, done) {
  if (ignore()) {
    return;
  }
  const $container = options.container;
  const updatePreview = options.updatePreview;
  const end = done || noop;
  const xhrOpts = {
    url: `/api/metadata/scrape?url=` + encodeURIComponent(options.url),
    json: true
  };
  taunus.xhr(xhrOpts, scraped);

  function ignore () {
    if (!options.source) {
      return;
    }
    const $el = $(options.source);
    const url = $el.value().trim();
    if (!rweb.test(url)) {
      return true;
    }
    const old = $el.attr(`data-last-scraped`);
    $el.attr(`data-last-scraped`, url);
    if (url.length === 0 || url === old) {
      return true;
    }
  }
  function scraped (err, data) {
    if (err) {
      end(err); return;
    }
    const firstImage = data.images && data.images[0] || ``;
    const description = (data.description || ``).trim();
    const sourceHref = `https://twitter.com/` + (data.twitter ? data.twitter.slice(1) : ``);
    const imageInput = $(`.wa-link-image`, $container);
    const imageInputContainer = $(`.wa-link-image-container`, $container);

    updateInputs();
    updateImageSwapper();
    updateThumbnail($container);
    updatePreview();
    end(null);

    function updateInputs () {
      $(`.wa-link-title`, $container).value(data.title || options.url.replace(rprotocol, ``));
      $(`.wa-link-description`, $container).value(description);
      $(`.wa-link-source`, $container).value(data.source || ``);
      $(`.wa-link-source-href`, $container).value(sourceHref);
      $(`.wa-link-image`, $container).value(firstImage);
      $(`.wa-link-tags`, $container).value(``);
      $(`.wa-link-tag`, $container).value(false);
      $(`.wa-link-sponsored`, $container).value(false);
    }

    function updateImageSwapper () {
      const swapper = data.images.length > 1;
      if (swapper) {
        swapperOn();
      } else {
        swapperOff();
      }
    }

    function swapperOff () {
      const toggler = $(`.wa-toggler`, imageInputContainer);
      swapperOffEvent(toggler);
    }

    function swapperOn () {
      const toggler = $(`.wa-toggler`, imageInputContainer);
      const togglerLeft = $(`.wa-link-image-left`, imageInputContainer);
      const togglerRight = $(`.wa-link-image-right`, imageInputContainer);
      let index = 0;

      swapperOffEvent(toggler);
      togglerLeft.addClass(`wa-toggler-off`);
      togglerRight.removeClass(`wa-toggler-off`);

      swapperOnEvent(toggler, swap);

      function swap (e) {
        const $el = $(e.target);
        if ($el.hasClass(`wa-toggler-off`)) {
          return;
        }
        const left = e.target === togglerLeft[0];
        index += left ? -1 : 1;
        imageInput.value(data.images[index] || ``);
        invalidate(-1, togglerLeft);
        invalidate(1, togglerRight);
        updateThumbnail($container);
        updatePreview();
      }

      function invalidate (offset, $el) {
        const on = typeof data.images[index + offset] === `string`;
        const op = on ? `removeClass` : `addClass`;
        $el[op](`wa-toggler-off`);
      }
    }

    function swapperOnEvent (toggler, swap) {
      toggler
        .removeClass(`uv-hidden`)
        .on(`click`, swap);
      swappers.push({ toggler: toggler, fn: swap });
    }

    function swapperOffEvent (toggler) {
      const swapper = findSwapper();
      toggler
        .addClass(`uv-hidden`)
        .off(`click`, swapper && swapper.fn);
      function findSwapper () {
        for (let i = 0; i < swappers.length; i++) {
          if ($(swappers[i].toggler).but(toggler).length === 0) {
            return swappers.splice(i, 1)[0];
          }
        }
      }
    }
  }
}

function updateThumbnail ($container) {
  const $image = $(`.wa-link-image`, $container);
  const $imagePreview = $(`.wa-link-image-preview`, $container);
  const imageValue = $image.value().trim();

  $imagePreview.attr(`src`, imageValue);

  if (imageValue.length) {
    $imagePreview.removeClass(`uv-hidden`);
  } else {
    $imagePreview.addClass(`uv-hidden`);
  }
}

module.exports = {
  scrape: scrape,
  updateThumbnail: updateThumbnail
};
