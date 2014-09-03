'use strict';

var env = require('../lib/env');
var name = env('NODE_ENV');
var authority = env('AUTHORITY');

function defaultRequestModel (req, done) {
  done(null, {
    model: {
      env: {
        name: name,
        authority: authority
      }
    }
  });
}

// images.{cover,list},description,canonical,keywords

module.exports = defaultRequestModel;
