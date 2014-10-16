'use strict';

require('../lib/logging').configure();

var _ = require('lodash');
var contra = require('contra');
var winston = require('winston');
var db = require('../lib/db');
var models = require('../models');
var env = require('../lib/env');
var markupService = require('../services/markup');
var m;

env('BULK_INSERT', true);
db(operational);

function operational () {
  winston.info('Connected to target database!');
  m = models();
  ready();
}

function ready () {
  m.Article.find({}).populate('comments').exec(resave);

  function resave (err, articles) {
    if (err) {
      throw err;
    }
    contra.each(articles, save, done);

    function save (article, next) {
      winston.info('Processing article "%s"', article.title);
      article.comments.forEach(saveComment);
      article.save(next);
    }

    function saveComment (comment) {
      comment.contentHtml = markupService.compile(comment.content, { deferImages: true, externalize: true });
    }
  }

  function done (err) {
    if (err) {
      throw err;
    }
    winston.info('Successfully executed hooks!');
    process.exit();
  }
}
