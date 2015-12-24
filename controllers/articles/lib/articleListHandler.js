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

    var keywords = metadataService.mostCommonTags(articles);
    var imagesResult = metadataService.extractImages(articles);
    var expanded = articles.map(expand);
    model.articles = expanded;
    model.meta.keywords = keywords;
    model.meta.images = imagesResult.images;
    inliningService.addStyles(model, options.search ? 'search' : 'summaries');
    next();

    function expand (article) {
      var model = articleService.toJSON(article, { meta: true, id: false });
      if (options.summary) {
        model.summary = summarize(article);
      }
      var images = imagesResult.map[article._id];
      if (images && images.length) {
        model.cover = images[0];
      }
      return model;
    }
  };
}

function summarize (article) {
  var all = article.teaserHtml + article.introductionHtml;
  var text = htmlService.getText(all);
  var truncated = textService.truncate(text, 170);
  return truncated;
}

module.exports = factory;
