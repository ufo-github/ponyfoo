'use strict';

var contra = require('contra');
var pkg = require('../package.json');
var env = require('../lib/env');
var name = env('NODE_ENV');
var authority = env('AUTHORITY');
var authorEmail = env('AUTHOR_EMAIL');
var bioService = require('../services/bio');

function getDefaultModel (done) {
  contra.waterfall([
    function (next) {
      bioService.getHtml(authorEmail, next);
    },
    function (bioHtml, next) {
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
          bioHtml: bioHtml
        }
      });
    }
  ], done);
}

module.exports = getDefaultModel;
