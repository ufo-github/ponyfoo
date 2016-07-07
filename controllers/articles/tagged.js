'use strict';

var util = require('util');
var articleService = require('../../services/article');
var articleSearchService = require('../../services/articleSearch');
var articleListHandler = require('./lib/articleListHandler');
var searchResults = require('./lib/searchResults');

module.exports = function (req, res, next) {
  var rseparator = /[+/,_: ]+/ig;
  var tags = req.params.tags.split(rseparator);
  var handlerOpts = {
    search: true,
    queryTerms: [],
    queryTags: tags
  };
  var handle = articleListHandler(res, handlerOpts, searchResults(res, next));

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
