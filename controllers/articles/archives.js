'use strict';

var _ = require('lodash');
var env = require('../../lib/env');
var articleService = require('../../services/article');
var metadataService = require('../../services/metadata');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  var query = { status: 'published' };

  articleService.find(query, function (err, articles) {
    if (err) {
      next(err); return;
    }
    var expanded = articles.map(articleService.toJSON);
    res.viewModel = {
      model: {
        meta: {
          canonical: authority + '/articles/archives',
          description: 'Every article ever published on Pony Foo can be found here!',
          keywords: metadataService.mostCommonTags(expanded),
          images: metadataService.appendDefaultCover([])
        },
        title: 'Archives',
        articles: expanded,
        total: _.pluck(expanded, 'readingTime').reduce(sum, 0)
      }
    };
    next();
  });

  function sum (accumulator, value) {
    return accumulator + value;
  }
};
