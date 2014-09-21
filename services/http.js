'use strict';

var env = require('../lib/env');
var authority = env('AUTHORITY');

function referer (req) {
  var r = req.headers.referer || '';
  return r.indexOf(authority) === 0 ? r : '/';
}

module.exports = {
  referer: referer
};
