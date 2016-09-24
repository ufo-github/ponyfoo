'use strict';

const markdownContainer = require(`markdown-it-container`);

module.exports = { setup };

function setup (parser) {
  parser.use(markdownContainer, `custom`, { validate, render });
}

function validate () {
  return true;
}

function render (tokens, idx) {
  const token = tokens[idx];
  const opening = token.nesting === 1;

  if (opening) {
    const { tagName, attrs } = parseTokenInfo(token.info.trim());
    return `<${ tagName }${ renderAttributes(attrs) }>`;
  }
  const { tagName } = parseTokenInfo(findOpen(tokens, idx).info.trim());
  return `</${ tagName }>`;
}

function findOpen (tokens, idx) {
  const openType = `container_custom_open`;
  const { level } = tokens[idx];
  for (let i = idx - 1; i >= 0; i--) {
    const token = tokens[i];
    if (token.level === level && token.type === openType) {
      return token;
    }
  }
}

function parseTokenInfo (info) {
  const rspace = /\s/;
  let tagName = `div`;
  let state = `tag`;
  let partial = ``;
  const attrs = {};
  for (const character of info) {
    if (state === `attr`) {
      if (character === `]`) { flush(); }
    } else {
      if (character === `[`) { flush(`attr`); continue; }
      if (character === `#`) { flush(`id`); continue; }
      if (character === `.`) { flush(`class`); continue; }
      if (rspace.test(character)) { flush(); continue; }
    }
    partial += character;
  }
  flush();

  return { tagName, attrs };

  function flush (nextState) {
    if (partial.length) {
      if (state === `tag`) {
        tagName = partial;
      } else if (state === `class` && attrs[state]) {
        attrs[state] += ` ${ partial }`;
      } else if (state === `attr`) {
        const trimmed = partial.trim();
        const space = trimmed.indexOf(` `);
        const key = trimmed.slice(0, space);
        const value = trimmed.slice(space + 1);
        attrs[key] = value.length ? value : key;
      } else if (state) {
        attrs[state] = partial;
      }
      partial = ``;
    }
    state = nextState;
  }
}

function renderAttributes (attrs) {
  return Object.keys(attrs).reduce(attributeReducer, ``);

  function attributeReducer (result, key) {
    return `${ result } ${ key }='${ attrs[key] }'`;
  }
}
