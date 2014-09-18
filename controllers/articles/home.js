'use strict';

var articleService = require('../../services/article');
var listOrSingle = require('./lib/listOrSingle');

module.exports = function (req, res, next) {
  var query = { status: 'published' };
  var handle = listOrSingle(res, next);

  res.viewModel = {
    model: {
      title: 'Pony Foo',
      meta: {
        canonical: '/'
      }
    }
  };

  articleService.find(query, { limit: 6 }, handle);
};
