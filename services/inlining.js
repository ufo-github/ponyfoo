'use strict';

const fs = require(`fs`);
const path = require(`path`);
const glob = require(`glob`);
const files = glob.sync(`.bin/inlined/*.css`);
const cache = files.reduce(reader, {});
const enabled = files.length;

function reader (cache, file) {
  const css = fs.readFileSync(file, `utf8`);
  const component = path.basename(file, `.css`);
  cache[component] = css;
  return cache;
}

function addStyles (host, component) {
  if (enabled && component in cache) {
    host.inlineStyles = {
      name: component,
      value: cache[component]
    };
    host.inlineStyles.toJSON = componentName;
  }
  function componentName () {
    return `[` + component + `]`;
  }
}

module.exports = {
  addStyles: addStyles
};
