'use strict';

var _ = require('lodash');
var articleService = require('../../services/article');
var metadataService = require('../../services/metadata');
var inliningService = require('../../services/inlining');

module.exports = function (req, res, next) {
  var query = { status: 'published' };
  var options = {
    fields: '-teaser -introduction -body -comments',
    populate: [['author', 'slug email avatar']]
  };

  articleService.find(query, options, function (err, articles) {
    if (err) {
      next(err); return;
    }
    var expanded = articles.map(function (article) {
      return articleService.toJSON(article, { meta: true, id: false });
    });
    res.viewModel = {
      model: {
        meta: {
          canonical: '/articles/history',
          description: 'Every article ever published on Pony Foo can be found here!',
          keywords: metadataService.mostCommonTags(expanded),
          images: metadataService.appendDefaultCover([])
        },
        title: 'Article Publication History on Pony Foo',
        articles: expanded,
        total: _.pluck(expanded, 'readingTime').reduce(sum, 0)
      }
    };
    inliningService.addStyles(res.viewModel.model, 'history');
    next();
  });

  function sum (accumulator, value) {
    return accumulator + value;
  }
};
