'use strict';

var util = require('util');
var articleService = require('../../services/article');
var articleSearchService = require('../../services/articleSearch');
var articleListHandler = require('./lib/articleListHandler');
var searchResults = require('./lib/searchResults');
var separator = /[+/,_: ]+/ig;

module.exports = function (req, res, next) {
  var tags = req.params.tags.split(separator);
  var title = util.format('Articles tagged "%s"', tags.join('", "'));
  var query = {
    status: 'published',
    tags: { $all: tags }
  };
  var handle = articleListHandler(res, { search: true }, searchResults(res, next));

  res.viewModel = {
    model: {
      title: title + ' on Pony Foo',
      meta: {
        canonical: '/articles/tagged/' + tags.join('+'),
        description: 'This search results page contains all of the ' + title.toLowerCase()
      },
      action: 'articles/search-results',
      query: articleSearchService.format([], tags)
    }
  };

  articleService.find(query, handle);
};
