'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var contra = require('contra');
var winston = require('winston');
var moment = require('moment');
var natural = require('natural');
var Article = require('../models/Article');
var store = path.resolve('./temp/natural.json');
var index;
var state = contra.emitter();

function computeFor (article, done) {
  var terms = article.slug.split(' ').join(article.tags);
  var related = [];
  var max = 6;

  rebuild(compute);

  function compute () {
    index.tfidfs(terms, function (i, weight) {
      var doc = index.documents[i];
      if (doc._id === article._id) {
        return;
      }
      related.push({
        doc: doc,
        weight: weight
      });
    });

    related.sort(diff);
    related.splice(max);

    contra.map(related, expand, computed);
  }

  function diff (a, b) {
    return a.weight - b.weight;
  }

  function expand (item, next) {
    Article.findOne({ _id: item.doc._id }, next);
  }

  function computed (err) {
    if (err) {
      done(err); return;
    }
    article.related = related.map(id);
    winston.debug('Natural relationship computed. %s match(es) found.', related.length);
    done();
  }
}

function id (item) {
  return item.doc._id;
}

function rebuild (done) {
  var start = moment();
  winston.debug('Natural index rebuilding...');
  index = new natural.TfIdf();
  Article.find({ status: 'published' }, function (err, articles) {
    if (err) {
      done(err); return;
    }
    articles.forEach(include);
    var end = moment().subtract(start).format('mm:ss.SSS');
    winston.debug('Natural index rebuilt in %s', end);
    done();
  });
}

function include (article) {
  winston.debug('Natural index processing "%s"...', article.title);
  _.remove(index.documents, { _id: article._id });
  index.addDocument(article);
}

module.exports = {
  computeFor: computeFor
};
