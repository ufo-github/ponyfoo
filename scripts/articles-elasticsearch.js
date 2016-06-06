'use strict';

var winston = require('winston');
var db = require('../lib/db');
var boot = require('../lib/boot');
var indexService = require('../services/articleElasticsearchIndex');

boot(booted);

function booted () {
  winston.info('Script is ensuring elasticsearch index exists.');
  indexService.ensureIndex(ensured);
}

function ensured (err) {
  if (err) {
    winston.error(err);
    end();
    return;
  }
  winston.info('Script ensured elasticsearch index exists.');
  end();
}

function end () {
  db.disconnect();
}
