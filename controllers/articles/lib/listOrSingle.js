'use strict';

var toJSON = require('./toJSON');

function factory (res, next) {
  return function listOrSingle (err, articles) {
    if (err) {
      next(err); return;
    }
    var model = res.viewModel.model;
    var single = articles.length === 1;
    var key = single ? 'article' : 'articles';

    model.action = 'articles/' + key;

    if (single) {
      model.full = true;
      model.title = articles[0].title;
      model[key] = toJSON(articles[0]);
    } else {
      model[key] = articles.map(toJSON);
    }
    next();
  };
}

module.exports = factory;
