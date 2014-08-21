'use strict';

var util = require('util');
var listOrSingle = require('./lib/listOrSingle');
var articleSearch = require('../../services/articleSearch');
var separator = /[+/,_: -]+/ig;

module.exports = function (req, res, next) {
  var terms = req.params.terms.split(separator);
  var handle = listOrSingle(res, next);

  res.viewModel = {
    model: {
      title: util.format('Search results for "%s"', terms.join(', '))
    }
  };

  articleSearch.query(terms, handle);
};
