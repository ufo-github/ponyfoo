'use strict';

var but = require('but');
var articleService = require('../../../services/article');
var metadataService = require('../../../services/metadata');

function factory (res, options, next) {
  if (arguments.length < 3) {
    next = options;
    options = {};
  }
  return function articleListHandler (err, articles) {
    if (err) {
      next(err); return;
    }
    var model = res.viewModel.model;
    if (!model.action) {
      model.action = 'articles/articles';

      if (articles.length === 0 && options.skip !== false) {
        res.viewModel.skip = true;
        next(); return;
      }
    }

    var expanded = articles.map(function (article) {
      return articleService.toJSON(article, { meta: true });
    });

    model.articles = expanded;
    model.meta.keywords = metadataService.mostCommonTags(articles);
    model.meta.images = metadataService.extractImages(articles);
    next();
  };
}

module.exports = factory;
