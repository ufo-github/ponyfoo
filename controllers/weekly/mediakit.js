'use strict';

var path = require('path');
var location = path.resolve('client/pdf/mediakit.pdf');

module.exports = function (req, res) {
  res.sendFile(location);
};
