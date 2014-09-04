'use strict';

var util = require('util');
var articleService = require('../../services/article');
var listOrSingle = require('./lib/listOrSingle');
var separator = /[+/,_: ]+/ig;

module.exports = function (req, res, next) {
  var tags = req.params.tags.split(separator);
  var query = {
    status: 'published',
    tags: { $all: tags }
  };
  var handle = listOrSingle(res, next);

  res.viewModel = {
    model: {
      title: util.format('Articles tagged "%s"', tags.join('", "'))
    }
  };

  articleService.find(query, handle);
};
