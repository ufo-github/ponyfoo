'use strict'

const contra = require(`contra`)
const User = require(`../../models/User`)
const Article = require(`../../models/Article`)
const userService = require(`../../services/user`)
const articleService = require(`../../services/article`)

module.exports = function (req, res, next) {
  const slug = req.params.slug
  const query = {
    slug: slug
  }
  contra.waterfall([findUser, findArticles], respond)

  function findUser (next) {
    User.findOne(query, next)
  }

  function findArticles (user, next) {
    if (!user) {
      next(`route`); return
    }
    const query = {
      author: user._id,
      status: `published`
    }
    const tasks = {
      list: getArticleList,
      count: getArticleCount
    }
    contra.concurrent(tasks, found)
    function getArticleList (next) {
      const options = {
        limit: 9
      }
      articleService.find(query, options, next)
    }
    function getArticleCount (next) {
      Article
        .count(query)
        .exec(next)
    }
    function found (err, articles) {
      next(err, user, articles)
    }
  }

  function respond (err, user, articles) {
    if (err) {
      next(err); return
    }
    const contributor = {
      user: user,
      articleCount: articles.count
    }
    const active = userService.isActive(contributor)
    if (!active) {
      next(`route`); return
    }
    const profile = userService.getProfile(contributor, {
      withBio: true
    })
    res.viewModel = {
      model: {
        title: user.displayName + ` \u2014 Pony Foo`,
        meta: {
          canonical: `/contributors/` + slug,
          images: [profile.gravatar],
          description: user.bioText
        },
        profilePage: true, // used to hide parts of article list view
        profile: profile,
        articles: articleService.expandForListView(articles.list).articles,
        articleCount: articles.count
      }
    }
    next()
  }
}
