'use strict';

var path = require('path');
var location = path.resolve('.bin/static/sitemap.xml');

module.exports = function (req, res, next) {
  res.sendFile(location);
};
