'use strict';

var Article = require('../../../models/Article');

module.exports = function (req, res, next) {
  console.log(req.body);
  res.json(200);
};
