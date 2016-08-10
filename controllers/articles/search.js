'use strict';

const articleListHandler = require('./lib/articleListHandler');
const searchResults = require('./lib/searchResults');
const articleSearchService = require('../../services/articleSearch');

module.exports = function (req, res, next) {
  const rseparator = /[+/,_: -]+/ig;
  const input = req.params.terms;
  const terms = input.split(rseparator);
  const handlerOpts = {
    search: true,
    queryTerms: terms,
    queryTags: []
  };
  const handle = articleListHandler(res, handlerOpts, searchResults(res, next));

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
