'use strict';

var fs = require('fs');
var path = require('path');
var gm = require('gm');
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

function findPlugin (ext) {
  if (ext === 'png') {
    return pngquant();
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
  var diff = prettyBytes(-difference);
  var percentage = -(100 - stats.size * 100 / ul.size).toFixed(2);
  winston.debug('%s was %s, is %s, diff %s [%s%]', ul.originalname, was, is, diff, percentage);
}

function shrink (ul, done) {
  gm(ul.path).resize(limits.width, limits.height).write(ul.path, done);
}

function optimizeUpload (ul, done) {
  contra.series([
    function (next) {
      shrink(ul, next);
    },
    function (next) {
      getMinifier(ul).run(next);
    },
    function (next) {
      process.nextTick(function () {
        log(ul);
      });
      next();
    }
  ], done);
}

module.exports = {
  optimizeUpload: optimizeUpload
};
