'use strict'

const moment = require(`moment`)
const Article = require(`../../../models/Article`)
const articleService = require(`../../../services/article`)
const userService = require(`../../../services/user`)
const datetimeService = require(`../../../services/datetime`)

module.exports = function (req, res, next) {
  const slug = req.params.slug
  if (slug) {
    findArticle(respondUsingArticle)
  } else {
    respondWithEmptyComposer()
  }

  function findArticle (done) {
    Article
      .findOne({ slug: slug })
      .populate(`author`, `displayName slug avatar email twitter website`)
      .exec(done)
  }

  function respondUsingArticle (err, article) {
    if (err) {
      next(err); return
    }
    if (!article) {
      res.status(404).json({ messages: [`Article not found`] }); return
    }
    const canEdit = userService.canEditArticle({
      userId: req.user,
      userRoles: req.userObject.roles,
      authorId: article.author._id,
      articleStatus: article.status
    })
    if (!canEdit) {
      res.status(404).json({ messages: [`Article not found`] }); return
    }
    const originalAuthor = article.author._id.equals(req.user)
    const articleModel = articleService.toJSON(article, { editing: true })
    respondWithArticle({
      article: articleModel,
      editing: true,
      originalAuthor
    })
  }

  function respondWithEmptyComposer () {
    respondWithArticle({
      article: {
        tags: [],
        author: {
          slug: req.userObject.slug,
          displayName: req.userObject.displayName,
          avatar: req.userObject.avatar
        },
        status: `draft`,
        created: datetimeService.field(moment()),
        updated: datetimeService.field(moment()),
        publication: null
      },
      editing: false,
      originalAuthor: true
    })
  }

  function respondWithArticle({ article, editing, originalAuthor }) {
    res.viewModel = {
      model: {
        title: `Article Composer \u2014 Pony Foo`,
        articleComposer: true,
        editing,
        originalAuthor,
        article
      }
    }
    next()
  }
}
