'use strict';

var env = require('../../../lib/env');
var articleService = require('../../../services/article');
var metadataService = require('../../../services/metadata');
var htmlService = require('../../../services/html');
var textService = require('../../../services/text');
var authority = env('AUTHORITY');

function factory (res, next) {
  return function listOrSingle (err, articles) {
    if (err) {
      next(err); return;
    }
    var model = res.viewModel.model;
    var article = articles.length === 1 && articles[0];
    var key = article ? 'article' : 'articles';

    model.action = 'articles/' + key;

    if (article) {
      article.populate('prev next related comments', single);
    } else {
      model[key] = articles.map(articleService.toJSON);
      model.meta.keywords = metadataService.mostCommonTags(articles);
      model.meta.images = metadataService.extractImages(articles);
      next();
    }

    function single (err, article) {
      if (err) {
        next(err); return;
      }
      model.full = true;
      model.title = article.title;
      model.meta = {
        canonical: authority + '/articles/' + article.slug,
        description: textService.truncate(htmlService.getText(article.introductionHtml), 170),
        keywords: article.tags,
        images: metadataService.extractImages(article)
      };
      model[key] = articleService.toJSON(article);
      next();
    }
  };
}

module.exports = factory;
