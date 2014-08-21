'use strict';

var Article = require('../../models/Article');
var listOrSingle = require('./lib/listOrSingle');

module.exports = function (req, res, next) {
  var query = { status: 'published' };
  var handle = listOrSingle(res, next);

  res.viewModel = { model: { title: 'Pony Foo' } };

  Article.find(query).populate('prev next related').sort('-publication').exec(handle);
};
