'use strict';

var winston = require('winston');
var db = require('../lib/db');
var boot = require('../lib/boot');
var indexService = require('../services/articleElasticsearchIndex');

boot(booted);

function booted () {
  winston.debug('Ensuring elasticsearch index exists.');
  indexService.ensureIndex(ensured);
}

function ensured (err) {
  if (err) {
    winston.error(err);
    end();
    return;
  }
  winston.info('Ensured elasticsearch index exists.');
  end();
}

function end () {
  db.disconnect();
}
