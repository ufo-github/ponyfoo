'use strict';

const but = require('but');
const winston = require('winston');
const Article = require('../models/Article');
const es = require('../lib/elasticsearch');
const indexName = 'ponyfoo';
const typeName = 'article';
const mapping = {
  properties: {
    timestamp: { type: 'date' },
    title: { type: 'string' },
    slug: { type: 'string' },
    teaser: { type: 'string' },
    introduction: { type: 'string' },
    body: { type: 'string' },
    tags: { type: 'string', index: 'not_analyzed' },
    status: { type: 'string', index: 'not_analyzed' }
  }
};
const ensureQueue = [];
let ensuring = false;
let ensured = false;

function toIndex (article) {
  return {
    timestamp: article.created,
    title: article.title,
    slug: article.slug,
    teaser: article.teaser,
    introduction: article.introduction,
    body: article.body,
    tags: article.tags,
    status: article.status
  };
}

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
    const op = {
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
    const op = {
      body: articles.reduce(toBulk, [])
    };
    es.client.bulk(op, done);
  }
}

function ensureIndexThen (next) {
  return function wrapper (...args) {
    const last = args[args.length - 1];
    const done = typeof last === 'function' ? last : warn;

    if (ensured) {
      initialized(null); return;
    }
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
      ensureQueue.push({ process: next, args, done });
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
    update: {
      _index: indexName,
      _type: typeName,
      _id: article._id
    }
  });
  body.push({
    doc: toIndex(article),
    doc_as_upsert: true
  });
  return body;
}

function ensureIndex (done) {
  ensureIndexThen(done)(null, but(done));
}

module.exports = {
  toIndex: toIndex,
  ensureIndex: ensureIndex,
  ensureIndexThen: ensureIndexThen
};
