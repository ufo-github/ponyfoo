'use strict';

var _ = require('lodash');
var Article = require('../../models/Article');
var articleService = require('../../services/article');

module.exports = getModel;

function getModel (req, res, next) {
  Article.find({}).sort('-publication').exec(respond);

  function respond (err, articles) {
    if (err) {
      next(err); return;
    }
    var models = articles.map(function (article) {
      return articleService.toJSON(article, { meta: true });
    });
    var sorted = _.sortBy(models, sortByStatus);
    res.viewModel = {
      model: {
        title: 'Article Review',
        meta: {
          canonical: '/author/review'
        },
        articles: sorted
      }
    };
    next();
  }
}

function sortByStatus (article) {
  return { draft: 0, publish: 1, published: 2 }[article.status];
}
