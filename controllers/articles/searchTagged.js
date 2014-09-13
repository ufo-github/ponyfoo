'use strict';

var util = require('util');
var listOrSingle = require('./lib/listOrSingle');
var articleSearch = require('../../services/articleSearch');
var env = require('../../lib/env');
var authority = env('AUTHORITY');
var tagSeparator = /[+/,_: ]+/ig;
var termSeparator = /[+/,_: -]+/ig;

module.exports = function (req, res, next) {
  var tags = req.params.tags.split(tagSeparator);
  var terms = req.params.terms.split(termSeparator);
  var handle = listOrSingle(res, next);
  var fmt = 'Search results for "%s" in articles tagged "%s"';
  var title = util.format(fmt, terms.join('", "'), tags.join('", "'));

  res.viewModel = {
    model: {
      title: title,
      meta: {
        canonical: authority + '/articles/search/' + terms.join('-') + '/tagged/' + tags.join('+'),
        description: 'This search results page contains all of the ' + title.toLowerCase()
      }
    }
  };

  articleSearch.query(terms, tags, handle);
};
