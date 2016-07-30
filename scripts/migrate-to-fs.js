'use strict';

var contra = require('contra');
var winston = require('winston');
var db = require('../lib/db');
var boot = require('../lib/boot');
var Article = require('../models/Article');
var gitService = require('../services/git');

contra.waterfall([
  next => boot(next),
  next => Article.find({ status: 'published' }).exec(next),
  (articles, next) => contra.each(articles, 3, migrate, next)
], err => {
  if (err) {
    winston.error(err.stack || err);
  }
  db.disconnect();
  process.exit(err ? 1 : 0);
});

function migrate (article, done) {
  gitService.articleToSyncRoot(article, done);
}
