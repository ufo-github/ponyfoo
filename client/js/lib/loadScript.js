'use strict';

var tag = 'script';

function loadScript (url, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = {};
  } else if (!options) {
    options = {};
  }
  var first;
  var script = document.createElement(tag);
  script.async = true;
  script.src = url;
  if (done) { script.onload = done; }
  if (options.id) { script.id = options.id; }
  if (options.container) {
    options.container.appendChild(script);
  } else {
    first = document.getElementsByTagName(tag)[0];
    first.parentNode.insertBefore(script, first);
  }
  return script;
}

module.exports = loadScript;
