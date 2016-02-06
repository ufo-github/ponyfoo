'use strict';

var _ = require('lodash');
var moment = require('moment');
var contra = require('contra');
var but = require('but');
var freq = require('freq');
var util = require('util');
var hget = require('hget');
var winston = require('winston');
var common = require('./common_english.json').reduce(toMap, {});
var env = require('../lib/env');
var Article = require('../models/Article');
var feedService = require('./feed');
var sitemapService = require('./sitemap');
var searchLimit = 6;
var unsafeTerms = /[^\w]+/ig;
var irrelevant = [
  'javascript', 'js', 'css', 'web', 'https', 'com',
  'performance', 'github', 'taunus', 'http',
  'ponyfoo', 'pony', 'foo', 'mark', 'google'
];
var processing = {};

function sanitizeTerm (term) {
  return term.replace(unsafeTerms, '');
}

function query (input, options, done) {
  var terms = input.map(sanitizeTerm);
  if (done === void 0) {
    done = options; options = {};
  }
  var q = { status: 'published' };

  if (options.oldest) {
    q.created = { $gt: options.oldest };
  }
  if (options.tags && options.tags.length) {
    q.tags = { $all: options.tags };
  }

  q.$text = { $search: terms.join(' ') };

  var cursor = Article
    .find(q)
    .sort('-publication');

  if (options.unlimited !== true) {
    cursor = cursor.limit(searchLimit);
  }

  cursor.exec(done);
}

function bracket (tag) {
  return util.format('[%s]', tag);
}

function format (terms, tags) {
  return util.format('"%s"', tags.map(bracket).concat(terms).join(' '));
}

function insanely (html) {
  return hget('<div>' + html + '</div>');
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

  var text = [
    article.title,
    article.tags.join(' '),
    insanely(article.bodyHtml),
    insanely(article.teaserHtml),
    insanely(article.introductionHtml)
  ].join(' ');
  var relevant = text.replace(/([-_*`\[\]\/}{=><:]|<\/?(kbd|mark)>|https?|www\.?|\.com)/g, ' ');
  var frequencies = freq(relevant).filter(sanely);
  var sorted = _.sortByOrder(frequencies, ['count'], ['desc']);
  var filtered = sorted.slice(0, 6);
  var terms = _.pluck(filtered, 'word');
  var options = {
    unlimited: true,
    oldest: moment('2014-01-01', 'YYYY-MM-DD').toDate() // avoid terrible articles
  };
  query(terms, options, queried);

  function queried (err, articles) {
    if (err) {
      winston.warn(err); done(err); return;
    }
    var ids = _(articles)
      .sample(searchLimit)
      .pluck('_id')
      .reject(article._id)
      .value();

    article.related = ids;

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
    feedService.rebuild();
    sitemapService.rebuild();
    done();
  }
}

function sanely (entry) {
  return !common[entry.word] && entry.word.length > 1 && irrelevant.indexOf(entry.word) === -1;
}

function toMap (map, word) {
  map[word] = 1; return map;
}

module.exports = {
  query: query,
  format: format,
  addRelated: addRelated,
  addRelatedAll: addRelatedAll
};
