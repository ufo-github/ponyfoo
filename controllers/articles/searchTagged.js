'use strict';

var util = require('util');
var articleListHandler = require('./lib/articleListHandler');
var searchResults = require('./lib/searchResults');
var articleSearchService = require('../../services/articleSearch');

module.exports = function (req, res, next) {
  var rtagSeparator = /[+/,_: ]+/ig;
  var rtermSeparator = /[+/,_: -]+/ig;
  var input = req.params.terms;
  var tags = req.params.tags.split(rtagSeparator);
  var terms = input.split(rtermSeparator);
  var handle = articleListHandler(res, { search: true }, searchResults(res, next));
  var fmt = 'Search results for "%s" in articles tagged "%s"';
  var title = util.format(fmt, terms.join('", "'), tags.join('", "'));

  res.viewModel = {
    model: {
      title: title + ' on Pony Foo',
      meta: {
        canonical: '/articles/search/' + terms.join('-') + '/tagged/' + tags.join('+'),
        description: 'This search results page contains all of the ' + title.toLowerCase()
      },
      action: 'articles/search-results',
      query: articleSearchService.format(terms, tags)
    }
  };

  articleSearchService.query(input, { tags: tags, populate: 'author' }, handle);
};
