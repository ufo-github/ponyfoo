'use strict';

var _ = require('lodash');
var moment = require('moment');
var contra = require('contra');
var but = require('but');
var util = require('util');
var winston = require('winston');
var env = require('../lib/env');
var Article = require('../models/Article');
var articleElasticsearchService = require('./articleElasticsearch');
var articleFeedService = require('./articleFeed');
var sitemapService = require('./sitemap');
var processing = {};

function query (input, options, done) {
  if (done === void 0) {
    done = options;
    options = {};
  }
  articleElasticsearchService.query(input, options, queried);
  function queried (err, result) {
    if (err) {
      done(err); return;
    }
    var q = { _id: { $in: _.pluck(result, '_id') } };
    Article.find(q).sort('-publication').exec(done);
  }
}

function bracket (tag) {
  return util.format('[%s]', tag);
}

function format (terms, tags) {
  return util.format('"%s"', tags.map(bracket).concat(terms).join(' '));
}

function update (article, done) {
  articleElasticsearchService.update(article, updated);
  function updated (err, exists) {
    if (err) {
      done(err); return;
    }
    addRelated(article, done);
  }
}

function addRelated (article, forced, done) {
  if (done === void 0) {
    done = forced;
    forced = false;
  }

  if (processing[article._id]) {
    processing[article._id] = false;
    done(); return;
  }
  if (!forced) {
    done();
    if (article.related && article.related.length) {
      return;
   }
  }
  processing[article._id] = true;

  var options = {
    since: moment('2014-01-01', 'YYYY-MM-DD').toDate() // avoid floating terrible articles
  };

  articleElasticsearchService.related(article, options, queried);

  function queried (err, result) {
    if (err) {
      done(err); return;
    }
    article.related = _.pluck(result, '_id');
    if (forced) {
      article.save(but(done));
    } else {
      article.save();
    }
  }
}

function addRelatedAll (done) {
  env('BULK_INSERT', true);
  winston.info('Computing relationships for articles site-wide');
  contra.waterfall([
    function findAll (next) {
      Article.find({ status: 'published' }, next);
    },
    function compute (articles, next) {
      contra.each(articles, 3, addRelatedArticles, but(next));
      function addRelatedArticles (article, next) {
        winston.debug('Computing relationships for: "%s"', article.slug);
        addRelated(article, true, save);
        function save (err) {
          if (err) {
            next(err); return;
          }
          winston.debug('Computed relationships for: "%s"', article.slug);
          article.save(but(next));
        }
      }
    }
  ], unbulk);
  function unbulk (err) {
    env('BULK_INSERT', false);
    if (err) {
      winston.warn('Error computing relationships', err);
      done(err); return;
    }
    winston.info('Relationship computation completed');
    articleFeedService.rebuild();
    sitemapService.rebuild();
    done();
  }
}

module.exports = {
  query: query,
  format: format,
  update: update,
  addRelated: addRelated,
  addRelatedAll: addRelatedAll
};
