'use strict';

var util = require('util');
var articleListHandler = require('./lib/articleListHandler');
var searchResults = require('./lib/searchResults');
var articleSearchService = require('../../services/articleSearch');
var separator = /[+/,_: -]+/ig;

module.exports = function (req, res, next) {
  var input = req.params.terms;
  var terms = input.split(separator);
  var title = util.format('Search results for "%s"', terms.join('", "'));
  var handle = articleListHandler(res, { search: true }, searchResults(res, next));

  res.viewModel = {
    model: {
      title: title,
      meta: {
        canonical: '/articles/search/' + terms.join('-'),
        description: 'This search results page contains all of the ' + title.toLowerCase()
      },
      action: 'articles/search-results',
      query: articleSearchService.format(terms, [])
    }
  };

  articleSearchService.query(input, { populate: 'author' }, handle);
};
