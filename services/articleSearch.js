'use strict';

var _ = require('lodash');
var contra = require('contra');
var moment = require('moment');
var winston = require('winston');
var Article;
var fulltextSearch = require('./fulltextSearch');
var fulltext = fulltextSearch();

function similar (article, done) {
  var terms = article.slug.split(' ').join(article.tags);
  query(terms, done);
}

function query (terms, done) {
  contra.waterfall([
    function compute (next) {
      fulltext.compute(terms, next);
    },
    function expand (matches, next) {
      var ids = _.pluck(matches, '_id');
      var query = { _id: { $in: ids } };
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
    fulltext.rebuild(articles, done);
  }
}

module.exports = {
  similar: similar,
  query: query,
  rebuild: rebuild
};
