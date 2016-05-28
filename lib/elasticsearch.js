'use strict';

var once = require('once');
var elasticsearch = require('elasticsearch');
var emitter = require('contra/emitter');
var log = require('./loggingElasticsearch');
var env = require('./env');
var host = env('ELASTICSEARCH_HOST');
var es = emitter(once(provider));

function provider (done) {
  es.client = new elasticsearch.Client({
    apiVersion: '2.3',
    host: host,
    log: log
  });
  es.emit('start');
}

module.exports = es;
