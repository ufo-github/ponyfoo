'use strict';

var _ = require('lodash');
var contra = require('contra');
var Article;
var fulltextSearch = require('./fulltextSearch');
var fulltext = fulltextSearch();

function similar (article, done) {
  var terms = fulltext.terms(indexable(article));
  query(terms, done);
}

function query (terms, done) {
  contra.waterfall([
    function compute (next) {
      fulltext.compute(terms, next);
    },
    function expand (matches, next) {
      var query = { _id: { $in: matches } };
      Article.find(query, next);
    }
  ], done);
}

function rebuild (done) {
  Article = require('../models/Article');
  Article.find({ status: 'published' }, fill);

  function fill (err, articles) {
    if (err) {
      done(err); return;
    }
    fulltext.rebuild(articles.map(indexable), done);
  }
}

function indexable (article) {
  var fields = ['title', 'tags', 'body', 'introduction', 'slug'];
  var important = _(article)
    .pick(fields)
    .toArray()
    .flatten()
    .value()
    .join(' ');

  return article._id + '; ' + important;
}

module.exports = {
  similar: similar,
  query: query,
  rebuild: _.debounce(rebuild, 2000)
};
