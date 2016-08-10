'use strict';

const fs = require('fs');
const gm = require('gm');
const but = require('but');
const path = require('path');
const contra = require('contra');
const Imagemin = require('imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const gifsicle = require('imagemin-gifsicle');
const winston = require('winston');
const prettyBytes = require('pretty-bytes');
const env = require('../lib/env');
const level = env('LOGGING_LEVEL');
const limits = {
  width: 900,
  height: 550
};

function findPlugin (file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') {
    return pngquant();
  } else if (ext === '.jpg' || ext === '.jpeg') {
    return mozjpeg();
  } else if (ext === '.gif') {
    return gifsicle({ interlaced: true });
  }
}

function getMinifier (options) {
  const imagemin = new Imagemin().src(options.file).dest(path.dirname(options.file));
  const plugin = findPlugin(options.file);
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
    const was = prettyBytes(options.size);
    const is = prettyBytes(stats.size);
    const difference = options.size - stats.size;
    const diff = prettyBytes(-difference);
    const percentage = -(100 - stats.size * 100 / options.size).toFixed(2);
    winston.info('%s was %s, is %s, diff %s [%s%]', options.name, was, is, diff, percentage);
  });
}

function magic (options, done) {
  let op = gm(options.file);

  op = op.autoOrient();

  if (options.preserveSize !== true) {
    op = op.resize(limits.width, limits.height);
  }

  if (options.grayscale === true) {
    op = op.channel('gray');
  }

  op.write(options.file, done);
}

function optimize (options, done) {
  contra.series([
    function magicStep (next) {
      magic(options, next);
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
