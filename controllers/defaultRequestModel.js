'use strict';

var pkg = require('../package.json');
var env = require('../lib/env');
var name = env('NODE_ENV');
var authority = env('AUTHORITY');
var authorEmail = env('AUTHOR_EMAIL');
var bioService = require('../services/bio');

function defaultRequestModel (req, done) {
  bioService.getHtml(authorEmail, function (err, bioHtml) {
    if (err) {
      done(err); return;
    }
    done(null, {
      model: {
        bioHtml: bioHtml,
        pkg: {
          version: pkg.version
        },
        env: {
          name: name,
          authority: authority
        }
      }
    });
  });
}

module.exports = defaultRequestModel;
