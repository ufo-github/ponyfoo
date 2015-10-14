'use strict';

var fs = require('fs');
var secret = fs.readFileSync('.bin/secret', 'utf8').trim();

function secretOnly (req, res, next) {
  next(req.params.secret === secret ? null : 'route');
}

module.exports = secretOnly;
