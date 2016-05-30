'use strict';

var winston = require('winston');
var Article = require('../models/Article');
var es = require('../lib/elasticsearch');
var indexName = 'ponyfoo';
var typeName = 'article';
var mapping = {
  properties: {
    created: { type: 'date' },
    title: { type: 'string' },
    slug: { type: 'string' },
    teaser: { type: 'string' },
    introduction: { type: 'string' },
    body: { type: 'string' },
    tags: { type: 'string' }
  }
};
var ensuring = false;
var ensured = false;
var ensureQueue = [];

function initialize (done) {
  es.client.indices.exists({ index: indexName }, existed);

  function existed (err, exists) {
    if (err) {
      done(err); return;
    }
    if (exists) {
      winston.debug('Elasticsearch index already existed.');
      done(null);
      return;
    }
    winston.debug('Creating elasticsearch index.');
    es.client.indices.create({ index: indexName }, createdIndex);
  }

  function createdIndex (err) {
    if (err) {
      done(err); return;
    }
    winston.debug('Creating elasticsearch mapping for articles.');
    var op = {
      index: indexName,
      type: typeName,
      body: mapping
    };
    es.client.indices.putMapping(op, createdMapping);
  }

  function createdMapping (err) {
    if (err) {
      done(err); return;
    }
    bulkIndexAllArticles(insertedArticles);
  }

  function insertedArticles (err) {
    if (err) {
      done(err); return;
    }
    winston.info('Ensured elasticsearch index exists.');
    done(null);
  }
}

function bulkIndexAllArticles (done) {
  winston.debug('Looking up articles on MongoDB database.');
  Article.find({}).exec(found);
  function found (err, articles) {
    if (err) {
      done(err); return;
    }
    winston.debug('Bulk inserting articles into elasticsearch.');
    var op = {
      body: articles.reduce(toBulk, [])
    };
    es.client.bulk(op, done);
  }
}

function ensureIndexThen (next) {
  return function wrapper () {
    var args = Array.prototype.slice.call(arguments);

    if (ensured) {
      initialized(null); return;
    }
    var last = args[args.length - 1];
    var done = typeof last === 'function' ? last : warn;

    if (ensuring) {
      enqueue(); return;
    }
    ensuring = true;

    initialize(initialized);

    function initialized (err) {
      enqueue();
      deplete(err);
    }

    function deplete (err) {
      if (!err) {
        ensured = true;
      }
      while (ensureQueue.length) {
        dequeue(err, ensureQueue.shift());
      }
      ensuring = false;
    }

    function enqueue () {
      ensureQueue.push({
        process: next,
        args: args,
        done: done
      });
    }

    function dequeue (err, item) {
      if (err) {
        item.done.call(null, err); return;
      }
      item.process.apply(null, item.args);
    }
  };
}

function warn (err) {
  if (err) { winston.warn(err); }
}

function toBulk (body, article) { // bulk follows [command,document] pattern
  body.push({
    index: {
      _index: indexName,
      _type: typeName,
      _id: article._id
    }
  });
  body.push(toIndex(article));
  return body;
}

function toIndex (article) {
  return {
    created: article.created,
    title: article.title,
    slug: article.slug,
    teaser: article.teaser,
    introduction: article.introduction,
    body: article.body,
    tags: article.tags
  };
}

function ensureIndex (done) {
  ensureIndexThen(done)(null, pass);
  function pass (err) {
    done(err);
  }
}

module.exports = {
  ensureIndex: ensureIndex,
  ensureIndexThen: ensureIndexThen
};
