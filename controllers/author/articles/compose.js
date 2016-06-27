'use strict';

var Article = require('../../../models/Article');

module.exports = function (req, res, next) {
  var slug = req.params.slug;

  res.viewModel = {
    model: {
      title: 'Article Composer',
      status: 'draft',
      article: { tags: [] },
      editing: !!slug,
      originalAuthor: true
    }
  };

  if (slug) {
    Article.findOne({ slug: slug }).lean().exec(populate);
  } else {
    next();
  }

  function populate (err, article) {
    if (err) {
      next(err); return;
    }
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    var model = res.viewModel.model;
    model.originalAuthor = article.author.equals(req.user);
    model.article = article;
    model.article.tags = article.tags || [];
    next();
  }
};
