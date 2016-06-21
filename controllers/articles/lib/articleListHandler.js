'use strict';

var articleService = require('../../../services/article');
var metadataService = require('../../../services/metadata');
var textService = require('../../../services/text');
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
    var expanded = articleService.expandForListView(articles);
    model.articles = expanded.articles;
    model.meta.keywords = keywords;
    model.meta.images = expanded.extracted.images;
    inliningService.addStyles(model, options.search ? 'search' : 'summaries');
    next();
  };
}

module.exports = factory;
