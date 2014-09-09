'use strict';

var articleService = require('../../../services/article');

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
      next();
    }

    function single (err, article) {
      if (err) {
        next(err); return;
      }
      model.full = true;
      model.title = article.title;
      model[key] = articleService.toJSON(article);
      next();
    }
  };
}

module.exports = factory;
