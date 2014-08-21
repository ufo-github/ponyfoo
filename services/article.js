'use strict';

var _ = require('lodash');
var contra = require('contra');
var articleSearch = require('./articleSearch');
var Article = require('../models/Article');

function addRelated (article, done) {
  articleSearch.similar(article, related);

  function related (err, articles) {
    if (err) {
      done(err); return;
    }
    article.related = _(articles)
      .reject({ _id: article._id })
      .pluck('_id')
      .first(6)
      .value();

    done();
  }
}

function addRelatedThenSave (article, done) {
  contra.series([
    contra.curry(addRelated, article),
    contra.curry(article.save)
  ], done);
}

function refreshRelated (done) {
  Article.find({ published: true }, function (err, articles) {
    if (err) {
      done(err); return;
    }
    contra.each(articles, addRelatedThenSave, done);
  });
}

module.exports = {
  addRelated: addRelated,
  refreshRelated: refreshRelated
};
