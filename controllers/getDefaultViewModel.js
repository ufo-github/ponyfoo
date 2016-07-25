'use strict';

var fs = require('fs');
var contra = require('contra');
var pkg = require('../package.json');
var env = require('../lib/env');
var nodeEnv = env('NODE_ENV');
var authority = env('AUTHORITY');
var ownerEmail = env('OWNER_EMAIL');
var staticService = require('../services/static');
var popularityService = require('../services/popularity');

function read (file) {
  return function (next) {
    fs.readFile(file, { encoding: 'utf8' }, next);
  };
}

function getDefaultViewModel (done) {
  contra.concurrent({
    popularArticles: popularityService.getArticles,
    javascriptLoader: read('.bin/inline/javascript.js'),
    styleLoader: read('.bin/inline/styles.js'),
    fontLoader: read('.bin/inline/fonts.js')
  }, forward);

  function forward (err, data) {
    if (err) {
      done(err); return;
    }

    done(null, {
      rss: 'https://feeds.feedburner.com/ponyfoo',
      founder: {
        contact: 'Nicolás Bevacqua <nico@ponyfoo.com>',
        twitter: '@nzgb'
      },
      description: '',
      model: {
        environment: nodeEnv,
        authority: authority,
        title: 'Pony Foo \u2014 JavaScript consulting, modularity, front-end architecture, performance, and more. Authored by Nicolás Bevacqua',
        pkg: {
          version: pkg.version
        },
        meta: {
          description: 'Pony Foo is a technical blog maintained by Nicolás Bevacqua, where he shares his thoughts on JavaScript and the web. Nico likes writing, public speaking, and open-source.',
          images: [authority + staticService.unroll('/img/banners/branded.png')],
          keywords: []
        },
        popularArticles: data.popularArticles
      },
      javascriptLoader: data.javascriptLoader,
      styleLoader: data.styleLoader,
      fontLoader: data.fontLoader
    });
  }
}

module.exports = getDefaultViewModel;
