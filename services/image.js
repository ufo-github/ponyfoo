'use strict';

var fs = require('fs');
var path = require('path');
var Imagemin = require('imagemin');
var optipng = require('imagemin-optipng');
var mozjpeg = require('imagemin-mozjpeg');
var gifsicle = require('imagemin-gifsicle');
var winston = require('winston');
var prettyBytes = require('pretty-bytes');
var env = require('../lib/env');
var level = env('LOGGING_LEVEL');

function findPlugin (ext) {
  if (ext === 'png') {
    // warning: higher levels have better yield but are _way_ too slow!
    return optipng({ optimizationLevel: 1 });
  } else if (ext === 'jpg' || ext === 'jpeg') {
    return mozjpeg();
  } else if (ext === 'gif') {
    return gifsicle({ interlaced: true });
  }
}

function getMinifier (ul) {
  var imagemin = new Imagemin().src(ul.path).dest(path.dirname(ul.path));
  var plugin = findPlugin(ul.extension);
  if (plugin) {
    imagemin.use(plugin);
  }
  return imagemin;
}

function log (ul) {
  if (level !== 'debug') {
    return;
  }
  var stats = fs.statSync(ul.path);
  var was = prettyBytes(ul.size);
  var is = prettyBytes(stats.size);
  var difference = ul.size - stats.size;
  var diff = prettyBytes(difference);
  var percentage = (100 - stats.size * 100 / ul.size).toFixed(2);
  winston.debug('%s was: %s, is: %s, diff: %s (%s%)', ul.originalname, was, is, diff, percentage);
}

function optimizeUpload (ul, done) {
  getMinifier(ul).run(processed);

  function processed (err, buffers) {
    if (err) {
      done(err); return;
    }
    process.nextTick(function () {
      log(ul);
    });
    done(err, ul);
  }
}

module.exports = {
  optimizeUpload: optimizeUpload
};
