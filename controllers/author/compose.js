'use strict';

var contra = require('contra');
var Article = require('../../models/Article');

module.exports = function (req, res, next) {
  var slug = req.params.slug;

  res.viewModel = {
    model: {
      title: 'Article Composer',
      meta: {
        canonical: authority + '/author/compose'
      },
      article: { tags: [] },
      editing: !!slug
    }
  };

  if (slug) {
    Article.findOne({ slug: slug }, populate);
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
    res.viewModel.model.article = article;
    next();
  }
};
