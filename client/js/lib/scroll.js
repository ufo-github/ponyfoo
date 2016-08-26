'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const { emitter } = require(`contra`);
const debounce = require(`lodash/debounce`);
const refreshScrollSlowly = raf.bind(null, debounce(refreshScroll, 10));
const body = document.body;
const html = document.documentElement;
const api = emitter({ track });

init();

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
  const state = {
    scrolled
  };
  api.state = state;
  api.emit(`scroll`, state);
}

function track (fn) {
  api.on(`scroll`, fn);
  setTimeout(() => fn(api.state), 0);
  return () => api.off(`scroll`, fn);
}

module.exports = api;
