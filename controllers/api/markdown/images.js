'use strict';

var path = require('path');
var ponymark = require('ponymark');
var env = require('../../../lib/env');
var dir = path.resolve('./uploads/images');

module.exports = ponymark.images({
  imgur: env.IMGUR_API_KEY,
  local: dir
});
