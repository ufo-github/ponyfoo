'use strict';

const once = require('once');
const elasticsearch = require('elasticsearch');
const log = require('./loggingElasticsearch');
const env = require('./env');
const username = env('ELASTICSEARCH_USERNAME');
const password = env('ELASTICSEARCH_PASSWORD');
const provider = once(init);

function init () {
  provider.client = new elasticsearch.Client({
    apiVersion: '2.3',
    host: [{ auth: username + ':' + password }],
    log: log
  });
}

module.exports = provider;
