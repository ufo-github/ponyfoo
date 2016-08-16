'use strict';

const Article = require(`../../../models/Article`);
const userService = require(`../../../services/user`);

module.exports = function (req, res, next) {
  const slug = req.params.slug;
  if (slug) {
    findArticle(respondUsingArticle);
  } else {
    respondWithEmptyComposer();
  }

  function findArticle (done) {
    Article
      .findOne({ slug: slug })
      .populate(`author`, `displayName slug avatar email`)
      .lean()
      .exec(done);
  }

  function respondUsingArticle (err, article) {
    if (err) {
      next(err); return;
    }
    if (!article) {
      res.status(404).json({ messages: [`Article not found`] }); return;
    }
    const canEdit = userService.canEditArticle({
      userId: req.user,
      userRoles: req.userObject.roles,
      authorId: article.author._id,
      articleStatus: article.status
    });
    if (!canEdit) {
      res.status(404).json({ messages: [`Article not found`] }); return;
    }
    const originalAuthor = article.author._id.equals(req.user);
    article.author = {
      slug: article.author.slug,
      displayName: article.author.displayName,
      avatar: userService.getAvatar(article.author)
    };
    res.viewModel = {
      model: {
        title: `Article Composer`,
        editing: true,
        originalAuthor,
        article
      }
    };
    next();
  }

  function respondWithEmptyComposer () {
    res.viewModel = {
      model: {
        title: `Article Composer`,
        editing: false,
        originalAuthor: true,
        authorDisplayName: req.userObject.displayName,
        article: {
          tags: [],
          author: {
            slug: req.userObject.slug,
            displayName: req.userObject.displayName,
            avatar: req.userObject.avatar
          }
        }
      }
    };
    next();
  }
};
