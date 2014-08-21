'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var Article = require('../models/Article');
var fulltextSearch = require('./fulltextSearch');
var fulltext = fulltextSearch();
var emitter = contra.emitter();

function similar (article, done) {
  rebuildOnce(function built () {
    var terms = fulltext.terms(indexable(article));
    query(terms, filtered);
  });

  function filtered (err, articles) {
    done(err, articles ? articles.filter(strangers) : articles);
  }

  function strangers (a) { // makes no sense to suggest a sibling
    return !a._id.equals(article.prev) && !a._id.equals(article.next);
  }
}

function query (terms, done) {
  rebuildOnce(function built () {
    contra.waterfall([
      function compute (next) {
        fulltext.compute(terms, next);
      },
      function expand (matches, next) {
        var query = {
          _id: { $in: matches },
          status: 'published'
        };
        Article.find(query).populate('prev next related').exec(next);
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
  } else if (emitter.rebuilding) {
    emitter.once('rebuilt', done);
  } else {
    emitter.rebuilding = true;
    Article.find({ status: 'published' }, fill);
  }

  function fill (err, articles) {
    if (err) {
      done(err); emitter.rebuilding = false; return;
    }
    fulltext.rebuild(articles.map(indexable), emitThenEnd);
  }

  function emitThenEnd () {
    emitter.rebuilding = false;
    emitter.emit('rebuilt');
    done();
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
  query: query,
  insert: insert
};
