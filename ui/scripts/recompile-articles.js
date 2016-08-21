'use strict';

const but = require(`but`);
const contra = require(`contra`);
const winston = require(`winston`);
const db = require(`../lib/db`);
const env = require(`../lib/env`);
const boot = require(`../lib/boot`);
const Article = require(`../models/Article`);
const markupService = require(`../services/markup`);

boot(booted);

function booted () {
  Article.find({ status: `published` }).exec(found);

  function found (err, articles) {
    if (err) {
      recompiled(end); return;
    }
    env(`BULK_INSERT`, true);
    contra.each(articles, 2, recompile, recompiled);
  }

  function recompile (article, next) {
    winston.debug(`Recompiling “%s” article.`, article.title);
    article.comments.forEach(recompileComment);
    article.sign = `force-recompile`;
    article.save(but(next));
    function recompileComment (comment) {
      const opts = {
        deferImages: true,
        externalize: true
      };
      comment.contentHtml = markupService.compile(comment.content, opts);
    }
  }
}

function recompiled (err) {
  env(`BULK_INSERT`, false);
  if (err) {
    winston.error(err);
    end();
    return;
  }
  end();
}

function end () {
  db.disconnect(() => process.exit(0));
}
