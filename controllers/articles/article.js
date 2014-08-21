'use strict';

var articleService = require('../../services/article');
var listOrSingle = require('./lib/listOrSingle');

module.exports = function (req, res, next) {
  var handle = listOrSingle(res, next);
  var query = {
    status: 'published',
    slug: req.params.slug
  };

  res.viewModel = { model: { title: 'Pony Foo' } };

  articleService.find(query, handle);
};
