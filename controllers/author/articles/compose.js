'use strict';

const Article = require('../../../models/Article');
const userService = require('../../../services/user');

module.exports = function (req, res, next) {
  const slug = req.params.slug;
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
    const canEdit = userService.canEditArticle({
      userId: req.user,
      userRoles: req.userObject.roles,
      authorId: article.author._id,
      articleStatus: article.status
    });
    if (!canEdit) {
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
