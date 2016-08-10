'use strict';

var articleListHandler = require('./lib/articleListHandler');
var searchResults = require('./lib/searchResults');
var articleSearchService = require('../../services/articleSearch');

module.exports = function (req, res, next) {
  var rseparator = /[+/,_: -]+/ig;
  var input = req.params.terms;
  var terms = input.split(rseparator);
  var handlerOpts = {
    search: true,
    queryTerms: terms,
    queryTags: []
  };
  var handle = articleListHandler(res, handlerOpts, searchResults(res, next));

  res.viewModel = {
    model: {
      meta: {
        canonical: '/articles/search/' + terms.join('-')
      },
      action: 'articles/search-results',
      query: articleSearchService.format(terms, [])
    }
  };

  articleSearchService.query(input, { populate: 'author' }, handle);
};
