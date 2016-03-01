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
  if (done) { script.onload = success; script.onerror = error; }
  if (options.id) { script.id = options.id; }
  if (options.container) {
    options.container.insertBefore(script, options.container.firstChild);
  } else {
    first = document.getElementsByTagName('link')[0];
    first.parentNode.insertBefore(script, first);
  }
  return script;
  function success () {
    done();
  }
  function error () {
    done(new Error('Error loading script: ' + url));
  }
}

module.exports = loadScript;
