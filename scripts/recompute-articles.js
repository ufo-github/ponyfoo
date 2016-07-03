'use strict';

var winston = require('winston');
var db = require('../lib/db');
var boot = require('../lib/boot');
var articleSearchService = require('../services/articleSearch');

boot(booted);

function booted () {
  articleSearchService.addRelatedAll(computed);
}

function computed (err) {
  if (err) {
    winston.error(err);
    end();
    return;
  }
  end();
}

function end () {
  db.disconnect();
}
