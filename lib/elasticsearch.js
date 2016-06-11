'use strict';

var once = require('once');
var elasticsearch = require('elasticsearch');
var log = require('./loggingElasticsearch');
var env = require('./env');
var username = env('ELASTICSEARCH_USERNAME');
var password = env('ELASTICSEARCH_PASSWORD');
var provider = once(init);

function init (done) {
  provider.client = new elasticsearch.Client({
    apiVersion: '2.3',
    host: [{ auth: username + ':' + password }],
    log: log
  });
}

module.exports = provider;
