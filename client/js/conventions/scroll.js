'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const debounce = require(`lodash/debounce`);
const refreshScrollSlowly = raf.bind(null, debounce(refreshScroll, 5));
const body = document.body;
const html = document.documentElement;

function init () {
  $(window).on(`scroll`, refreshScrollSlowly);
  refreshScroll();
}

function refreshScroll () {
  const position = (window.pageYOffset || html.scrollTop) - (html.clientTop || 0);
  const documentHeight = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
  const viewportHeight = Math.max(html.clientHeight, window.innerHeight || 0);
  const scrolled = position / (documentHeight - viewportHeight) * 100;
  const negated = 100 - scrolled;
  const visible = scrolled > 6;
  const show = visible ? `removeClass` : `addClass`;
  $(`.sp-line-wrapper`)[show](`uv-hidden`);
  $(`.sp-line`).css(`width`, negated + `%`);
}

module.exports = init;
