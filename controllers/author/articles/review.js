'use strict';

var _ = require('lodash');
var Article = require('../../../models/Article');
var articleService = require('../../../services/article');
var cryptoService = require('../../../services/crypto');

module.exports = getModel;

function getModel (req, res, next) {
  Article.find({}).sort('-publication').exec(respond);

  function respond (err, articles) {
    if (err) {
      next(err); return;
    }
    var models = articles.map(function (article) {
      var model = articleService.toJSON(article, { meta: true });
      if (model.status !== 'published') {
        model.permalink += '?verify=' + cryptoService.md5(model._id + model.created);
      }
      return model;
    });
    var sorted = _.sortBy(models, sortByStatus);
    res.viewModel = {
      model: {
        title: 'Article Review',
        meta: {
          canonical: '/articles/review'
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
