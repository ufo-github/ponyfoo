'use strict';

var _ = require('lodash');
var moment = require('moment');
var winston = require('winston');
var natural = require('natural');
var separator = '; ';

function factory () {
  var index;

  function insert (item) {
    var parts = item.split(separator);
    var key = parts[0];
    var value = parts[1];
    winston.debug('Natural index processing "%s"...', key);
    index.addDocument(value, key);
  }

  function compute (terms, done) {
    var start = moment();
    var results = [];

    winston.debug('Natural index computing "%s"...', terms.join(', '));

    index.tfidfs(terms, function (i, weight) {
      console.log(terms);
      console.log(weight);
      if (!weight) {
        return;
      }
      results.push({
        doc: index.documents[i].__key,
        weight: weight
      });
    });

    results.sort(diff);

    var fmt = 'Natural relationship computed. %s match(es) found in %s';
    var end = moment().subtract(start).format('mm:ss.SSS');
    winston.debug(fmt, results.length, end);
    done(null, _.pluck(results, 'doc'));

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

  function listTerms (key) {
    var doc = _.find(index.documents, { __key: key });
    var i = index.documents.indexOf(doc);
    console.log(index.documents);
  console.log(doc);
  console.log(i);
    return index.listTerms(i);
  }

  return {
    insert: insert,
    compute: compute,
    rebuild: _.debounce(rebuild, 2000),
    listTerms: listTerms
  };
}

module.exports = factory;
