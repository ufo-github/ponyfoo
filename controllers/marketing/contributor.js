'use strict';

var contra = require('contra');
var env = require('../../lib/env');
var User = require('../../models/User');
var Article = require('../../models/Article');
var userService = require('../../services/user');
var articleService = require('../../services/article');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  var query = {
    roles: {
      $in: ['owner', 'articles']
    },
    slug: slug
  };
  contra.waterfall([findUser, findArticles], respond);

  function findUser (next) {
    User.findOne(query, next);
  }

  function findArticles (user, next) {
    if (!user) {
      next('route'); return;
    }
    var query = {
      author: user._id,
      status: 'published'
    };
    var tasks = {
      list: getArticleList,
      count: getArticleCount
    };
    contra.concurrent(tasks, found);
    function getArticleList (next) {
      var options = {
        limit: 9
      };
      articleService.find(query, options, next);
    }
    function getArticleCount (next) {
      Article
        .count(query)
        .exec(next);
    }
    function found (err, articles) {
      next(err, user, articles);
    }
  }

  function respond (err, user, articles) {
    if (err) {
      next(err); return;
    }
    var profile = userService.getProfile(user, { withBio: true });
    res.viewModel = {
      model: {
        title: user.displayName + ' \u2014 Pony Foo',
        meta: {
          canonical: '/contributors/' + slug,
          images: [profile.gravatar],
          description: user.bioText
        },
        profilePage: true, // used to hide parts of article list view
        profile: profile,
        articles: articleService.expandForListView(articles.list).articles,
        articleCount: articles.count
      }
    };
    next();
  }
}
