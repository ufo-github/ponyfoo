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
  return articleListHandler;

  function articleListHandler (err, articles, extras) {
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

    if (extras) {
      if (extras.tags) {
        model.tags = extras.tags.map(toTagModel);
      }
    }

    inliningService.addStyles(model, options.search ? 'search' : 'summaries');
    next();
  }

  function toTagModel (tag) {
    return {
      slug: tag.slug,
      titleHtml: tag.titleHtml,
      descriptionHtml: tag.descriptionHtml
    };
  }
}

module.exports = factory;
