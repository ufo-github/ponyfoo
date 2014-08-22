'use strict';

var path = require('path');
var location = path.join(__dirname, '../../.bin/static/sitemap.xml');

module.exports = function (req, res, next) {
  res.sendfile(location);
};
