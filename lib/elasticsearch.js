'use strict';

var once = require('once');
var elasticsearch = require('elasticsearch');
var log = require('./loggingElasticsearch');
var env = require('./env');
var host = env('ELASTICSEARCH_HOST');
var provider = once(init);

function init (done) {
  provider.client = new elasticsearch.Client({
    apiVersion: '2.3',
    host: host,
    log: log
  });
}

module.exports = provider;
