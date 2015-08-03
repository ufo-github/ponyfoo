'use strict';

var _ = require('lodash');
var moment = require('moment');
var freq = require('freq');
var util = require('util');
var hget = require('hget');
var common = require('./common_english.json');
var Article = require('../models/Article');
var searchLimit = 6;
var unsafeTerms = /[^\w]+/ig;
var irrelevant = [
  'javascript', 'js', 'css', 'web', 'https', 'com',
  'performance', 'github', 'taunus', 'http',
  'ponyfoo', 'pony', 'foo', 'mark', 'google'
];

function sanitizeTerm (term) {
  return term.replace(unsafeTerms, '');
}

function query (input, options, done) {
  var terms = input.map(sanitizeTerm);
  if (done === void 0) {
    done = options; options = {};
  }
  var tagged = {
    tags: { $all: options.tags || [] }
  };
  var fulltext = {
    $text: { $search: terms.join(' ') }
  };
  var cursor = Article.find();

  if (options.oldest) {
    cursor = cursor.and([{ updated: { $gt: options.oldest } }]);
  }

  if (options.tags && options.tags.length) {
    cursor = cursor.and([tagged]);
  }

  cursor = cursor
    .and([fulltext])
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

function strip (text) {
  var rcommon = '([\\s\\W]+)(?:' + common.join('|') + ')([\\s\\W]+)';
  return text.replace(new RegExp(rcommon, 'gi'), '$1$2');
}

function addRelated (article, done) {
  var text = [
    article.title,
    article.tags.join(' '),
    insanely(article.bodyHtml),
    insanely(article.teaserHtml)
  ].join(' ');
  var relevant = text.replace(/([-_*`\[\]\/:]|<\/?(kbd|mark)>|https?|www\.?|\.com)/g, ' ');
  var frequencies = freq(strip(relevant));
  var sorted = _.sortByOrder(frequencies, ['count'], ['desc']);
  var filtered = sorted.filter(sanely).slice(0, 6);
  var terms = _.pluck(filtered, 'word');
  var options = {
    unlimited: true,
    oldest: moment('2014-01-01', 'YYYY-MM-DD').toDate() // avoid terrible articles
  };
  query(terms, options, queried);

  function queried (err, articles) {
    if (err) {
      done(err); return;
    }
    var ids = _(articles)
      .sample(searchLimit)
      .pluck('_id')
      .reject({ _id: article._id })
      .value();
    article.related = ids;
    done();
  }
}

function sanely (entry) {
  return entry.word.length > 5 && irrelevant.indexOf(entry.word) === -1;
}

module.exports = {
  query: query,
  format: format,
  addRelated: addRelated
};
