'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var Article = require('../models/Article');
var env = require('../lib/env');
var articleService = require('./article');
var feedService = require('./feed');
var sitemapService = require('./sitemap');
var fulltextSearch = require('./fulltextSearch');
var fulltext = fulltextSearch();
var emitter = contra.emitter();
var searchLimit = 6;
var unsafeTerms = /[^\w]+/ig;

function similar (article, done) {
  rebuildOnce(built);

  function built () {
    var terms = fulltext.terms(indexable(article));
    query(terms, filtered);
  }

  function filtered (err, articles) {
    done(err, articles ? articles.filter(strangers) : articles);
  }

  function strangers (a) { // makes no sense to suggest a sibling
    return !a._id.equals(article.prev) && !a._id.equals(article.next);
  }
}

function sanitizeTerm (term) {
  return term.replace(unsafeTerms, '');
}

function query (input, tags, done) {
  var terms = input.map(sanitizeTerm);
  if (done === void 0) {
    done = tags; tags = [];
  }
  rebuildOnce(built);

  function built () {
    contra.waterfall([compute, expand], done);
  }

  function compute (next) {
    fulltext.compute(terms, next);
  }

  function tagged (q) {
    if (tags.length) {
      q.tags = { $all: tags };
    }
    return q;
  }

  function expand (matches, next) {
    if (matches.length === 0) {
      findByTextMatch(next); return;
    }
    var q = tagged({
      status: 'published',
      _id: { $in: matches }
    });
    Article.find(q).sort('-publication').limit(searchLimit).exec(next);
  }

  function findByTextMatch (next) {
    var q = tagged({ status: 'published' });
    var pattern = util.format('\b(%s)\b', terms.join('|'));
    var alternatives = new RegExp(pattern, 'i');
    var cases = [{
      introduction: alternatives
    }, {
      body: alternatives
    }, {
      tags: { $in: terms }
    }];
    Article.find(q).or(cases).sort('-publication').limit(searchLimit).exec(next);
  }
}

function insert (article, done) {
  rebuildOnce(built);

  function built () {
    fulltext.insert(indexable(article));
  }
}

function rebuildOnce (done) {
  var next = done || Function.prototype;

  if (fulltext.built) {
    next();
  } else if (emitter.rebuilding) {
    emitter.once('rebuilt', next);
  } else {
    emitter.rebuilding = true;
    Article.find({ status: 'published' }, fill);
  }

  function fill (err, articles) {
    if (err) {
      next(err); emitter.rebuilding = false; return;
    }
    fulltext.rebuild(articles.map(indexable), emitThenEnd);
  }

  function emitThenEnd () {
    emitter.rebuilding = false;
    emitter.emit('rebuilt');
    next();
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
  var important = _(fields).transform(take).value().join(' ');

  function take (accumulator, field) {
    accumulator.push(article[field]);
  }
  return util.format('%s; %s', article._id, important);
}

function addRelated (article, done) {
  similar(article, related);

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
    article.save.bind(article)
  ], done);
}

function refreshRelated (done) {
  env('BULK_INSERT', true);
  Article.find({ status: 'published' }, function (err, articles) {
    if (err) {
      complete(err); return;
    }
    contra.each(articles, addRelatedThenSave, complete);
  });

  function complete (err) {
    env('BULK_INSERT', false);
    feedService.rebuild();
    sitemapService.rebuild();
    done(err);
  }
}

module.exports = {
  similar: similar,
  query: query,
  insert: insert,
  addRelated: addRelated,
  addRelatedThenSave: addRelatedThenSave,
  refreshRelated: refreshRelated,
  rebuild: rebuildOnce
};
