'use strict';

var but = require('but');
var contra = require('contra');
var winston = require('winston');
var db = require('../lib/db');
var env = require('../lib/env');
var boot = require('../lib/boot');
var Article = require('../models/Article');
var markup = require('../services/markup');

boot(booted);

function booted () {
  Article.find({ status: 'published' }).exec(found);

  function found (err, articles) {
    if (err) {
      recompiled(end); return;
    }
    env('BULK_INSERT', true);
    contra.each(articles, 2, recompile, recompiled);
  }

  function recompile (article, next) {
    winston.debug('Recompiling “%s” article.', article.title);
    article.comments.forEach(recompileComment);
    article.sign = 'force-recompile';
    article.save(but(next));
    function recompileComment (comment) {
      var opts = {
        deferImages: true,
        externalize: true
      };
      comment.contentHtml = markupService.compile(comment.content, opts);
    }
  }
}

function recompiled (err) {
  env('BULK_INSERT', false);
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
