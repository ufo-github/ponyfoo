'use strict';

var moment = require('moment');
var Article = require('../../models/Article');
var articleService = require('../../services/article');
var env = require('../../lib/env');
var authority = env('AUTHORITY');
var longDate = 'dddd Do, MMMM YYYY [at] HH:mm';

module.exports = function (req, res, next) {
  Article.find({}).sort('-created').exec(respond);

  function respond (err, articles) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Article Review',
        meta: {
          canonical: authority + '/author/review'
        },
        articles: articles.map(articleService.toJSON).map(hydrate)
      }
    };
    next();
  }
};

function hydrate (article) {
  article._ = {};

  var when = moment(article.publication);
  var published = article.status === 'published';
  if (published) {
    article._.condition = 'Published ' + when.fromNow();
    article._.conditionLabel = 'Published on ' + when.format(longDate);
  } else if (article.status === 'draft') {
    article._.condition = 'Draft';
    article._.conditionLabel = 'Edit the article in order to publish it';
  } else {
    article._.condition = 'Publishing ' + when.fromNow();
    article._.conditionLabel = 'Slated for publication on ' + when.format(longDate);
  }
  return article;
}
