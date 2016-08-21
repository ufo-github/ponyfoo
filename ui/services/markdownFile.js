'use strict';

const fs = require(`fs`);
const markupService = require(`./markup`);
const staticService = require(`./static`);
const env = require(`../lib/env`);
const nodeEnv = env(`NODE_ENV`);
const dev = nodeEnv === `development`;
const cached = {};

function read (file, done) {
  if (!dev && cached[file]) {
    done(null, cached[file]); return;
  }
  fs.readFile(file, `utf8`, compileMarkdown);

  function compileMarkdown (err, md) {
    if (err) {
      done(err); return;
    }
    const html = markupService.compile(md);
    const unrolled = staticService.unrollAll(html);
    cached[file] = unrolled;
    done(null, unrolled);
  }
}

module.exports = {
  read: read
};
