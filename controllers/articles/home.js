'use strict';

var articleService = require('../../services/article');
var listOrSingle = require('./lib/listOrSingle');
var env = require('../../lib/env');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  var query = { status: 'published' };
  var handle = listOrSingle(res, next);

  res.viewModel = {
    model: {
      title: 'Pony Foo',
      meta: {
        canonical: authority + '/'
      }
    }
  };

  articleService.find(query, { limit: 6 }, handle);
};
