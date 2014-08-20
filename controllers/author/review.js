'use strict';

var moment = require('moment');
var Article = require('../../models/Article');
var longDate = 'dddd Do, MMMM YYYY [at] HH:mm';

module.exports = function (req, res, next) {
  Article.find({}, respond);

  function respond (err, articles) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Article Review',
        articles: articles.map(hydrate)
      }
    };
    next();
  }
};

function hydrate (document) {
  var article = document.toJSON();

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
