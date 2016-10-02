'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const { emitter } = require(`contra`);
const debounce = require(`lodash/debounce`);
const refreshScrollSlowly = raf.bind(null, debounce(refreshScroll, 10));
const body = $(document.body);
const html = document.documentElement;
const api = emitter({ track });

init();

function init () {
  $(window).on(`scroll`, refreshScrollSlowly);
  refreshScroll();
}

function refreshScroll () {
  const viewportHeight = Math.max(html.clientHeight, window.innerHeight || 0);
  const distances = $(`.sp-item`).and(body).map((el) => {
    const rect = el.getBoundingClientRect();
    const top = rect.top * -1;
    const total = rect.height - viewportHeight;
    const scrolledRaw = top / total * 100;
    const scrolled = Math.max(0, Math.min(100, scrolledRaw));
    return { element: el, scrolled, scrolledRaw };
  });
  const state = { distances, scrolled: distances[0].scrolled };
  api.state = state;
  api.emit(`scroll`, state);
}

function track (fn) {
  api.on(`scroll`, fn);
  setTimeout(() => fn(api.state), 0);
  return () => api.off(`scroll`, fn);
}

module.exports = api;
