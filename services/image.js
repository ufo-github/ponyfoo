'use strict';

var fs = require('fs');
var gm = require('gm');
var but = require('but');
var path = require('path');
var contra = require('contra');
var Imagemin = require('imagemin');
var pngquant = require('imagemin-pngquant');
var mozjpeg = require('imagemin-mozjpeg');
var gifsicle = require('imagemin-gifsicle');
var winston = require('winston');
var prettyBytes = require('pretty-bytes');
var env = require('../lib/env');
var level = env('LOGGING_LEVEL');
var limits = {
  width: 900,
  height: 550
};

function findPlugin (file) {
  var ext = path.extname(file).toLowerCase();
  if (ext === '.png') {
    return pngquant();
  } else if (ext === '.jpg' || ext === '.jpeg') {
    return mozjpeg();
  } else if (ext === '.gif') {
    return gifsicle({ interlaced: true });
  }
}

function getMinifier (options) {
  var imagemin = new Imagemin().src(options.file).dest(path.dirname(options.file));
  var plugin = findPlugin(options.file);
  if (plugin) {
    imagemin.use(plugin);
  }
  return imagemin;
}

function log (options) {
  if (level !== 'debug') {
    return;
  }
  fs.stat(options.file, function gotStats (err, stats) {
    if (err) {
      return;
    }
    var was = prettyBytes(options.size);
    var is = prettyBytes(stats.size);
    var difference = options.size - stats.size;
    var diff = prettyBytes(-difference);
    var percentage = -(100 - stats.size * 100 / options.size).toFixed(2);
    winston.debug('%s was %s, is %s, diff %s [%s%]', options.name, was, is, diff, percentage);
  });
}

function shrink (options, done) {
  gm(options.file).autoOrient().resize(limits.width, limits.height).write(options.file, done);
}

function optimize (options, done) {
  contra.series([
    function shrinkStep (next) {
      shrink(options, next);
    },
    function minifyStep (next) {
      getMinifier(options).run(next);
    },
    function logStep (next) {
      process.nextTick(logLater);
      next();
    }
  ], but(done));

  function logLater () {
    log(options);
  }
}

module.exports = {
  optimize: optimize
};
