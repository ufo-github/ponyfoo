'use strict';

var but = require('but');
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
      var keywords = metadataService.mostCommonTags(articles);
      var imagesResult = metadataService.extractImages(articles);
      var expanded = articles.map(expand)
      model.articles = expanded;
      model.meta.keywords = keywords;
      model.meta.images = imagesResult.images;
      next();

      function expand (article) {
        var model = articleService.toJSON(article, { meta: true, id: false });
        var images = imagesResult.map[article._id];
        if (images && images.length) {
          model.cover = images[0];
        }
        return model;
      }
    }
  };
}

module.exports = factory;
