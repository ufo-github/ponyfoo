'use strict';

require(`../preconfigure`);
require(`../chdir`);

const winston = require(`winston`);
const db = require(`../lib/db`);
const boot = require(`../lib/boot`);
const indexService = require(`../services/articleElasticsearchIndex`);

boot(booted);

function booted () {
  winston.info(`Script is ensuring elasticsearch index exists.`);
  indexService.ensureIndex(ensured);
}

function ensured (err) {
  if (err) {
    winston.error(err);
    end();
    return;
  }
  winston.info(`Script ensured elasticsearch index exists.`);
  end();
}

function end () {
  db.disconnect(() => process.exit(0));
}
