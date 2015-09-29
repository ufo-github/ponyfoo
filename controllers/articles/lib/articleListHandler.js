'use strict';

var articleService = require('../../../services/article');
var metadataService = require('../../../services/metadata');
var textService = require('../../../services/text');
var htmlService = require('../../../services/html');
var inliningService = require('../../../services/inlining');

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
      var model = articleService.toJSON(article, { meta: true });
      if (options.summary) {
        model.summary = textService.truncate(htmlService.getText(article.teaserHtml + article.introductionHtml), 170);
      }
      return model;
    });

    model.articles = expanded;
    model.meta.keywords = metadataService.mostCommonTags(articles);
    model.meta.images = metadataService.extractImages(articles);
    inliningService.addStyles(model, options.search ? 'search' : 'summaries');
    next();
  };
}

module.exports = factory;
