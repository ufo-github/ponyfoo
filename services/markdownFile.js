'use strict';

var fs = require('fs');
var markupService = require('./markup');
var staticService = require('./static');
var env = require('../lib/env');
var nodeEnv = env('NODE_ENV');
var dev = nodeEnv === 'development';
var cached = {};

function read (file, done) {
  if (!dev && cached[file]) {
    done(null, cached[file]); return;
  }
  fs.readFile(file, 'utf8', compileMarkdown);

  function compileMarkdown (err, md) {
    if (err) {
      done(err); return;
    }
    var html = markupService.compile(md);
    var unrolled = staticService.unrollAll(html);
    cached[file] = unrolled;
    done(null, unrolled);
  }
}

module.exports = {
  read: read
};
