'use strict';

const gemoji = require(`gemoji`);
const htmlService = require(`./html`);
const markdownService = require(`./markdown`);

function compile (md, options) {
  const methods = [];
  const o = options || {};

  add(o.markdown !== false, emojify);
  add(o.markdown !== false, markdownService.compile);
  add(o.externalize, htmlService.externalizeLinks);
  add(o.deferImages, deferImages);
  add(o.absolutize, htmlService.absolutize);
  add(o.fixEmojiSize, htmlService.fixedEmojiSize);
  add(o.removeEmoji, htmlService.removeEmoji);
  add(o.minify !== false, htmlService.minify);
  add(o.linkThrough, linkThrough);

  const html = methods.reduce((result, method) => method(result), md);
  return html;

  function add (conditional, fn) {
    if (conditional) { methods.push(fn); }
  }

  function deferImages (html) {
    const i = typeof o.deferImages === `number` && o.deferImages;
    return htmlService.deferImages(html, i);
  }

  function linkThrough (html) {
    return htmlService.linkThrough(html, o.linkThrough);
  }
}

function emojify (input) {
  const remoji = /:([a-z_-]+):/ig;
  return input.replace(remoji, emojifyInput);
  function emojifyInput (all, name) {
    const data = gemoji.name[name];
    if (data) {
      return data.emoji;
    }
    return all;
  }
}

module.exports = {
  compile: compile
};
