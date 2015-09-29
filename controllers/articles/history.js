'use strict';

var _ = require('lodash');
var articleService = require('../../services/article');
var metadataService = require('../../services/metadata');

module.exports = function (req, res, next) {
  var query = { status: 'published' };
  var options = { fields: '-teaser -introduction -body -comments' };

  articleService.find(query, options, function (err, articles) {
    if (err) {
      next(err); return;
    }
    var expanded = articles.map(function (article) {
      return articleService.toJSON(article, { meta: true });
    });
    res.viewModel = {
      model: {
        meta: {
          canonical: '/articles/history',
          description: 'Every article ever published on Pony Foo can be found here!',
          keywords: metadataService.mostCommonTags(expanded),
          images: metadataService.appendDefaultCover([])
        },
        title: 'Publication History on Pony Foo',
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
