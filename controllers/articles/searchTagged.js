'use strict';

var articleListHandler = require('./lib/articleListHandler');
var searchResults = require('./lib/searchResults');
var articleSearchService = require('../../services/articleSearch');

module.exports = function (req, res, next) {
  var rtagSeparator = /[+/,_: ]+/ig;
  var rtermSeparator = /[+/,_: -]+/ig;
  var input = req.params.terms;
  var tags = req.params.tags.split(rtagSeparator);
  var terms = input.split(rtermSeparator);
  var handlerOpts = {
    search: true,
    queryTerms: terms,
    queryTags: tags
  };
  var handle = articleListHandler(res, handlerOpts, searchResults(res, next));

  res.viewModel = {
    model: {
      meta: {
        canonical: '/articles/search/' + terms.join('-') + '/tagged/' + tags.join('+')
      },
      action: 'articles/search-results',
      query: articleSearchService.format(terms, tags)
    }
  };

  articleSearchService.query(input, { tags: tags, populate: 'author' }, handle);
};
