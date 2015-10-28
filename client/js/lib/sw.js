'use strict';

var queso = require('queso').stringify;
var parse = require('omnibox/querystring').parse;

function toggleJSON (href, json, cb) {
  var url = new URL(href);
  var qs = parse(url.search.slice(1));
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
