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

  if (state.deserializing) {
    state.once('deserialized', compute);
  } else {
    compute();
  }

  function compute () {
    index.tfidfs(terms, function (key, weight) {
      if (key === article._id) {
        return;
      }
      related.push({
        key: key,
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
    Article.findOne({ _id: item.key }, next);
  }

  function computed (err, related) {
    if (err) {
      done(err); return;
    }
    article.related = related;
    done();
  }
}

function rebuild (done) {
  Article.find({ status: 'published' }, function (err, articles) {
    if (err) {
      done(err); return;
    }
    articles.forEach(function (article) {
      include(article, true);
    });
    serialize();
    done();
  });
}

function include (article, quiet) {
  winston.debug('Natural index processing "%s"...', article.title);
  _.remove(index.documents, { __key: article._id });
  index.addDocument(article, article._id);

  if (quiet !== false) {
    process.nextTick(serialize);
  }
}

function serialize () {
  var json = JSON.stringify(index);
  fs.writeFile(store, json, { encoding: 'utf8' });
}

function deserialize () {
  var start = moment();

  state.deserializing = true;
  winston.debug('Natural index processing...');
  fs.readFile(store, { encoding: 'utf8' }, initialize);

  function initialize (err, data) {
    var serialized = err ? null : JSON.parse(data);

    index = new natural.TfIdf(serialized);

    if (index.documents.length === 0) {
      winston.debug('Natural index rebuilding...');
      rebuild(deserialized);
    } else {
      deserialized();
    }
  }

  function deserialized (err) {
    if (err) {
      winston.info('Natural index deserialization error\n%s', err); return;
    }
    var end = moment().subtract(start).format('mm:ss.SSS');
    winston.debug('Natural index deserialization took %s', end);
    state.emit('deserialized');
    state.deserializing = false;
  }
}

deserialize();

module.exports = {
  computeFor: computeFor,
  include: include
};
