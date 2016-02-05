'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var contra = require('contra');
var moment = require('moment');
var env = require('../lib/env');
var models = require('../models');
var htmlService = require('../services/html');
var markdownService = require('../services/markdown');
var db = require('../lib/db');
var authority = env('AUTHORITY');
var base = '/Users/nico/dev/articles';

contra.waterfall([
  next => db(next),
  next => models().Article.find({}).exec(next),
  (articles, next) => contra.each(articles, 3, migrate, next)
], err => process.exit(err ? 1 : 0));

function migrate (article, done) {
  const date = moment(article.created).format('YYYY-MM-DD--');
  const dir = path.join(base, date + article.slug);
  contra.series([
    next => mkdirp(path.join(dir, 'source'), next),
    next => contra.concurrent([
      next => console.log(date + article.slug), next(),
      next => write('source/metadata.json', JSON.stringify({
        id: article._id,
        title: article.title,
        slug: article.slug,
        tags: article.tags,
        publication: moment(article.publication).format('DD-MM-YYYY HH:mm'),
        status: article.status,
        social: {
          email: article.email,
          tweet: article.tweet,
          fb: article.fb,
          echojs: article.echojs,
          lobsters: article.lobsters,
          hn: article.hn
        }
      }, null, 2), next),
      next => dec('source/summary.markdown', article.summaryHtml, next),
      next => dec('source/teaser.markdown', article.teaserHtml, next),
      next => dec('source/introduction.markdown', article.introductionHtml, next),
      next => dec('source/body.markdown', article.bodyHtml, next),
      next => abs('summary.html', article.summaryHtml, next),
      next => abs('teaser.html', article.teaserHtml, next),
      next => abs('introduction.html', article.introductionHtml, next),
      next => abs('body.html', article.bodyHtml, next)
    ], next)
  ], done);

  function dec (filename, data, done) {
    const decompiled = markdownService.decompile(data, {
      href: authority + '/articles/' + article.slug
    });
    write(filename, decompiled, done);
  }
  function abs (filename, data, done) {
    write(filename, htmlService.absolutize(data), done);
  }
  function write (filename, data, done) {
    fs.writeFile(path.join(dir, filename), data.trim() + '\n', 'utf8', done);
  }
}
