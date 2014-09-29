'use strict';

var path = require('path');
var location = path.resolve('.bin/static/feed.xml');

module.exports = function (req, res, next) {
  res.sendFile(location);
};
