'use strict';

var contra = require('contra');
var uglify = require('uglify-js');
var pkg = require('../package.json');
var env = require('../lib/env');
var name = env('NODE_ENV');
var authority = env('AUTHORITY');
var authorEmail = env('AUTHOR_EMAIL');
var bioService = require('../services/bio');

function min (file, next) {
  next(null, uglify.minify(file).code);
}

function getDefaultViewModel (done) {
  console.log('getting');
  contra.concurrent({
    bioHtml: function (next) {
      bioService.getHtml(authorEmail, next);
    },
    fontLoader: function (next) {
      min('client/js/inline/fonts.js', next);
    },
    javascriptLoader: function (next) {
      min('client/js/inline/javascript.js', next);
    },
    styleLoader: function (next) {
      min('client/js/inline/styles.js', next);
    }
  }, forward);

  function forward (err, data) {
    if (err) {
      done(err); return;
    }

    done(null, {
      author: {
        contact: 'Nicolas Bevacqua <foo@bevacqua.io>',
        twitter: '@nzgb'
      },
      description: '',
      model: {
        title: 'Pony Foo',
        pkg: {
          version: pkg.version
        },
        env: {
          name: name,
          authority: authority
        },
        meta: {
          description: 'Pony Foo is a technical blog maintained by Nicolas Bevacqua, where he shares his thoughts on JavaScript and the web. Nico likes writing, public speaking, and open-source.',
          images: ['http://ponyfoo.com/img/thumbnail.png'],
          keywords: []
        },
        bioHtml: data.bioHtml
      },
      fontLoader: data.fontLoader,
      javascriptLoader: data.javascriptLoader,
      styleLoader: data.styleLoader
    });
  }
}

module.exports = getDefaultViewModel;
