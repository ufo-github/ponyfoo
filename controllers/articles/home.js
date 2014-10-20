'use strict';

var validationService = require('../../services/validation');
var articleService = require('../../services/article');
var listOrSingle = require('./lib/listOrSingle');

module.exports = function (req, res, next) {
  var query = { status: 'published' };
  var handle = listOrSingle(res, next);
  var skip = validationService.integer(req.query.skip, 0);

  res.viewModel = {
    model: {
      title: 'Pony Foo',
      meta: {
        canonical: '/'
      },
      skipped: skip
    }
  };

  articleService.find(query, { limit: 6, skip: skip }, handle);
};
