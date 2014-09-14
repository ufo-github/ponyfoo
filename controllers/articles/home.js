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
        canonical: authority + '/',
        description: 'Pony Foo is a technical blog maintained by Nicolas Bevacqua, where he shares his thoughts on JavaScript and the web. Nico likes writing, public speaking, and open-source.'
      }
    }
  };

  articleService.find(query, { limit: 6 }, handle);
};
