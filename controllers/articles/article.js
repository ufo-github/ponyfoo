'use strict';

var Article = require('../../models/Article');
var listOrSingle = require('./lib/listOrSingle');

module.exports = function (req, res, next) {
  var handle = listOrSingle(res, next);
  var query = {
    status: 'published',
    slug: req.params.slug
  };

  res.viewModel = { model: { title: 'Pony Foo' } };

  Article.find(query).populate('prev next related').exec(handle);
};
