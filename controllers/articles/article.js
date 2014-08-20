'use strict';

var Article = require('../../models/Article');

module.exports = function (req, res, next) {
  var query = {
    status: 'published',
    slug: req.params.slug
  };
  Article.findOne(query).lean().exec(handle);

  function handle (err, article) {
    if (err) {
      next(err); return;
    }
    if (!article) {
      res.json(404, { messages: ['Article not found'] }); return;
    }
    res.viewModel = {
      model: {
        title: article.title,
        article: article
      }
    };
    next();
  }
};
