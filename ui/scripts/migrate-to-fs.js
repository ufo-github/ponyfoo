'use strict';

const contra = require(`contra`);
const winston = require(`winston`);
const db = require(`../lib/db`);
const boot = require(`../lib/boot`);
const Article = require(`../models/Article`);
const articleGitService = require(`../services/articleGit`);

contra.waterfall([
  next => boot(next),
  next => Article.find({ status: `published` }).exec(next),
  (articles, next) => contra.each(articles, 3, migrate, next)
], err => {
  if (err) {
    winston.error(err.stack || err);
  }
  db.disconnect(() => process.exit(0));
});

function migrate (article, done) {
  articleGitService.updateSyncRoot(article, done);
}
