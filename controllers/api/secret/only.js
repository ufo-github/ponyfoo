'use strict';

var fs = require('fs');
var secret = fs.readFileSync('.bin/secret', 'utf8').trim();

function secretOnly (req, res, next) {
  if (req.params.secret !== secret) {
    next('route'); return;
  }
  next();
}

module.exports = secretOnly;
