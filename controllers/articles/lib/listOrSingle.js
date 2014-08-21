'use strict';

function factory (res, next) {
  return function listOrSingle (err, articles) {
    if (err) {
      next(err); return;
    }
    var single = articles.length === 1;
    var key = single ? 'article' : 'articles';
    res.viewModel.model.action = 'articles/' + key;
    res.viewModel.model.full = single;
    res.viewModel.model[key] = single ? articles[0] : articles;
    next();
  };
}

module.exports = factory;
