'use strict';

var _ = require('lodash');
var moment = require('moment');
var winston = require('winston');
var natural = require('natural');
var gramophone = require('gramophone');
var separator = '; ';

function factory () {
  var index;

  function insert (item) {
    var parts = item.split(separator);
    var key = parts[0];
    var value = gramophone.extract(parts[1], { flatten: true });
    winston.debug('Natural index processing "%s"...', key);
    index.addDocument(value, key);
  }

  function compute (terms, done) {
    var start = moment();
    var results = [];

    winston.debug('Natural index computing "%s"...', terms.join(', '));

    index.tfidfs(terms, function (i, weight) {
      if (!weight) {
        return;
      }
      results.push({
        item: index.documents[i].__key,
        weight: weight
      });
    });

    results.sort(diff);

    var fmt = 'Natural relationship computed. %s match(es) found in %s';
    var end = moment().subtract(start).format('mm:ss.SSS');
    winston.debug(fmt, results.length, end);
    done(null, _.pluck(results, 'item'));

    function diff (a, b) {
      return a.weight - b.weight;
    }
  }

  function rebuild (documents, done) {
    var start = moment();
    winston.debug('Natural index rebuilding...');
    index = new natural.TfIdf();
    documents.forEach(insert);
    var end = moment().subtract(start).format('mm:ss.SSS');
    winston.debug('Natural index rebuilt in %s', end);
    done();
  }

  function terms (item) {
    var parts = item.split(separator);
    var key = parts[0];
    var value = parts[1];
    var i = index.documents.length;
    var result;

    index.addDocument(value, key);
    result = index.listTerms(i);

    return _(result).sortBy('tfidf').pluck('term').value().slice(0, 4);
  }

  return {
    insert: insert,
    compute: compute,
    rebuild: _.debounce(rebuild, 2000),
    terms: terms
  };
}

module.exports = factory;
