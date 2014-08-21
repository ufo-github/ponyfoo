'use strict';

var Article = require('../../models/Article');
var listOrSingle = require('./lib/listOrSingle');

module.exports = function (req, res, next) {
  var query = { status: 'published' };
  var handle = listOrSingle(res, next);

  res.viewModel = { model: {} };

  Article.find(query).sort('-publication').exec(handle);
};
