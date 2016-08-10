'use strict';

const path = require('path');
const location = path.resolve('client/pdf/mediakit.pdf');

module.exports = function (req, res) {
  res.sendFile(location);
};
