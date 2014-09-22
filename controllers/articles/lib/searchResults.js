'use strict';

var Article = require('../../../models/Article');
var articleService = require('../../../services/article');
var metadataService = require('../../../services/metadata');
var randomService = require('../../../services/random');

function factory (res, next) {
  return function searchResults (err) {
    var model = res && res.viewModel && res.viewModel.model;
    if (err || model.article || model.articles && model.articles.length) {
      next(err); return;
    }
    model.fail = true;
    randomService.find(Article, { status: 'published' }, 5, fill);

    function fill (err, articles) {
      if (err) {
        next(err); return;
      }
      model.articles = articles.map(articleService.toJSON);
      model.meta.keywords = metadataService.mostCommonTags(articles);
      model.meta.images = metadataService.extractImages(articles);
      next();
    }
  };
}

module.exports = factory;
