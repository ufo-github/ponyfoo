'use strict';

var Article = require('../../../models/Article');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  if (slug) {
    findArticle();
  } else {
    respondWithEmptyComposer();
  }

  function findArticle () {
    Article
      .findOne({ slug: slug })
      .populate('author', 'displayName')
      .lean()
      .exec(respondUsingArticle);
  }

  function respondUsingArticle (err, article) {
    if (err) {
      next(err); return;
    }
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    res.viewModel = {
      model: {
        title: 'Article Composer',
        editing: true,
        originalAuthor: article.author._id.equals(req.user),
        authorDisplayName: article.author.displayName,
        article: article
      }
    };
    next();
  }

  function respondWithEmptyComposer () {
    res.viewModel = {
      model: {
        title: 'Article Composer',
        editing: false,
        originalAuthor: true,
        authorDisplayName: req.userObject.displayName,
        article: { tags: [] }
      }
    };
    next();
  }
};
