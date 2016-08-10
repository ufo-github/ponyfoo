'use strict';

const queso = require('queso').stringify;
const parse = require('omnibox/querystring').parse;

function toggleJSON (href, json, cb) {
  const url = new URL(href);
  const qs = parse(url.search.slice(1));
  if (json) {
    qs.json = true;
    qs.callback = 'taunusReady';
  } else {
    delete qs.json;
  }
  if (cb !== true) {
    delete qs.callback;
  }
  return url.origin + url.pathname + queso(qs);
}

module.exports = {
  toggleJSON: toggleJSON
};
