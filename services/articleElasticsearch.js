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
var relatedArticlesLimit = 6;
var ensured = false;

es.on('start', ensure(warn));

function initialize (done) {
  es.client.indices.exists({ index: indexName }, existed);

  function existed (err, exists) {
    if (err) {
      done(err); return;
    }
    if (exists) {
      done(null); return;
    }
    es.client.indices.create({ index: indexName }, createdIndex);
  }

  function createdIndex (err) {
    if (err) {
      done(err); return;
    }
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
    bulkIndexAllArticles(done);
  }
}

function bulkIndexAllArticles (done) {
  Article.find({}).exec(found);
  function found (err, articles) {
    if (err) {
      done(err); return;
    }
    var op = {
      body: articles.reduce(toBulk, [])
    };
    es.client.bulk(op, done);
  }
}

function ensure (next) {
  return function wrapper () {
    var args = Array.prototype.slice.call(arguments);

    if (ensured) {
      through(); return;
    }

    var last = args[args.length - 1];
    var done = typeof last === 'function' ? last : warn;

    initialize(initialized);

    function initialized (err) {
      if (err) {
        done(err); return;
      }
      winston.info('ensured elasticsearch index exists.');
      ensured = true;
      through();
    }

    function through () {
      next.apply(null, args);
    }
  };
}

function update (article, done) {
  es.client.update({
    index: indexName,
    type: typeName,
    id: article._id.toString(),
    body: {
      doc: toIndex(article)
    }
  }, done);
}

function query(input, options, done) {
  if (done === void 0) {
    done = options;
    options = {};
  }
  es.client.search({
    type: typeName,
    body: {
      query: {
        filtered: {
          filter: filters(options),
          query: {
            multi_match: {
              query: input,
              fields: ['title^3', 'teaser', 'introduction', 'content']
            }
          }
        }
      }
    }
  }, found(done));
}

function related (article, options, done) {
  if (done === void 0) {
    done = options;
    options = {};
  }
  es.client.search({
    type: typeName,
    body: {
      size: relatedArticlesLimit,
      filtered: {
        filter: filters(options),
        query: { more_like_this: { like: { _id: article._id.toString() } } }
      }
    }
  }, done);
}

function found (done) {
  return function through (err, result) {
    if (err) {
      done(err); return;
    }
    done(null, result.hits.hits.map(searchHitToResult));
  };
}

function warn (err) {
  if (err) { winston.warn(err); }
}

function filters (options) {
  var result = {};
  var tags = Array.isArray(options.tags) ? options.tags : [];
  if (tags.length) {
    result.bool = { must: tags.map(tagToFilter) };
  }
  if (options.since) {
    result.range = { created: { gte: options.since } };
  }
  return result;
}

function toBulk (body, article) {
  body.push({
    index: { _index: indexName, _type: typeName, _id: article._id }
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

function searchHitToResult (hit) {
  return {
    _id: hit._id,
    title: hit._source.title,
    slug: hit._source.slug
  };
}

function tagToFilter (tag) {
  return { term: { tags: tag } };
}

module.exports = {
  query: query,
  update: update,
  related: related
};
