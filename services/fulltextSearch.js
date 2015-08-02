'use strict';

var _ = require('lodash');
var natural = require('natural');
var gramophone = require('gramophone');
var separator = '; ';

function factory () {
  var index;
  var api;

  function insert (item) {
    var parts = item.split(separator);
    var key = parts[0];
    var value = gramophone.extract(parts[1], { flatten: true });
    index.addDocument(value, key);
  }

  function compute (terms, done) {
    var results = [];

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

    done(null, _.pluck(results, 'item'));

    function diff (a, b) {
      return b.weight - a.weight;
    }
  }

  function rebuild (documents, done) {
    index = new natural.TfIdf();
    documents.forEach(insert);
    api.built = true;
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

    var gram = gramophone.extract(item).filter(reasonable).slice(0, 5);
    if (gram.length) {
      return gram;
    }
    var tfidf = _(result).sortBy('tfidf').pluck('term').value().filter(reasonable).slice(0, 5);
    return tfidf;
  }

  function reasonable (term) {
    return term.length > 3 && term.indexOf(' ') === -1;
  }

  api = {
    insert: insert,
    compute: compute,
    rebuild: rebuild,
    terms: terms,
    built: false
  };

  return api;
}

module.exports = factory;
