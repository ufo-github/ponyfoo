'use strict';

const articleSearchService = require('../../services/articleSearch');
const articleListHandler = require('./lib/articleListHandler');
const searchResults = require('./lib/searchResults');

module.exports = function (req, res, next) {
  const rseparator = /[+/,_: ]+/ig;
  const tags = req.params.tags.split(rseparator);
  const handlerOpts = {
    search: true,
    queryTerms: [],
    queryTags: tags
  };
  const handle = articleListHandler(res, handlerOpts, searchResults(res, next));

  res.viewModel = {
    model: {
      meta: {
        canonical: '/articles/tagged/' + tags.join('+')
      },
      action: 'articles/search-results',
      query: articleSearchService.format([], tags)
    }
  };

  articleSearchService.query('', { tags: tags, populate: 'author' }, handle);
};
