'use strict';

var Article = require('../../models/Article');

module.exports = function (req, res, next) {
  Article.find({}, respond);

  function respond (err, articles) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Article Review',
        articles: articles
      }
    };
    next();
  }
};
