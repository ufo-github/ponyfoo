'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var Article;
var fulltextSearch = require('./fulltextSearch');
var fulltext = fulltextSearch();

function similar (article, done) {
  rebuildOnce(function built () {
    var terms = fulltext.terms(indexable(article));
    query(terms, done);
  });
}

function query (terms, done) {
  rebuildOnce(function built () {
    contra.waterfall([
      function compute (next) {
        fulltext.compute(terms, next);
      },
      function expand (matches, next) {
        var query = { _id: { $in: matches } };
        Article.find(query, next);
      }
    ], done);
  });
}

function insert (article, done) {
  rebuildOnce(function built () {
    fulltext.insert(indexable(article));
  });
}

function rebuildOnce (done) {
  if (fulltext.built) {
    done();
  } else {
    Article = require('../models/Article');
    Article.find({ status: 'published' }, fill);
  }

  function fill (err, articles) {
    if (err) {
      done(err); return;
    }
    fulltext.rebuild(articles.map(indexable), done);
  }
}

function indexable (article) {
  var fields = [
    'title', 'title', 'title',
    'tags', 'tags', 'tags',
    'body',
    'introduction',
    'slug'
  ];
  var important = _(fields)
    .transform(take)
    .value()
    .join(' ');

  function take (accumulator, field) {
    accumulator.push(article[field]);
  }
  return util.format('%s; %s', article._id, important);
}


module.exports = {
  similar: similar,
  query: query
};
