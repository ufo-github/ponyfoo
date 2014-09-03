'use strict';

var env = require('../lib/env');
var authority = env('AUTHORITY');

function defaultRequestModel (req, done) {
  done(null, {
    model: {
      env: {
        authority: authority
      }
    }
  });
}

// images.{cover,list},description,canonical,keywords

module.exports = defaultRequestModel;
