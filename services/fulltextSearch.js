'use strict';

var _ = require('lodash');
var moment = require('moment');
var winston = require('winston');
var natural = require('natural');

function factory () {
  var index;

  function insert (item, prop) {
    winston.debug('Natural index processing "%s"...', item[prop]);
    index.addDocument(item);
  }

  function compute (terms, options, done) {
    var start = moment();

    winston.debug('Natural index computing "%s"...', terms.join(', '));

    var results = [];
    var o = options || {};
    if (o.max === void 0) { o.max = 6; }

    index.tfidfs(terms, function (i, weight) {
      results.push({
        doc: index.documents[i],
        weight: weight
      });
    });

    results.sort(diff);
    results.splice(o.max);

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

  return {
    insert: insert,
    compute: compute
  };
}

module.exports = factory;
