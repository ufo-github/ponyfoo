'use strict';

const Article = require(`../../../models/Article`);
const articleService = require(`../../../services/article`);
const metadataService = require(`../../../services/metadata`);
const randomService = require(`../../../services/random`);

function factory (res, next) {
  return function searchResults (err) {
    const model = res && res.viewModel && res.viewModel.model;
    if (err || model.article || model.articles && model.articles.length) {
      next(err); return;
    }
    model.fail = true;
    randomService.find(Article, { status: `published` }, 5, fill);

    function fill (err, articles) {
      if (err) {
        next(err); return;
      }
      const keywords = metadataService.mostCommonTags(articles);
      const imagesResult = metadataService.extractImages(articles);
      const expanded = articles.map(expand);
      model.articles = expanded;
      model.meta.keywords = keywords;
      model.meta.images = imagesResult.images;
      next();

      function expand (article) {
        const model = articleService.toJSON(article, { meta: true, id: false });
        const images = imagesResult.map[article._id];
        if (images && images.length) {
          model.cover = images[0];
        }
        return model;
      }
    }
  };
}

module.exports = factory;
