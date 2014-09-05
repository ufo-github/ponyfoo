'use strict';

var contra = require('contra');
var Article = require('../../../models/Article');

function remove (req, res, next) {
  contra.waterfall([lookupArticle, found], handle);

  function lookupArticle (next) {
    var query = { slug: req.params.slug };
    Article.findOne(query).populate('prev next').exec(next);
  }

  function found (article, next) {
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    contra.concurrent([removal, unlinkLeft, unlinkRight], next);

    function removal (next) {
      article.remove(next);
    }

    function unlinkLeft (next) {
      if (!article.prev) {
        next(); return;
      }
      article.prev.next = article.next;
      article.prev.save(function saved (err) {
        next(err);
      });
    }

    function unlinkRight (next) {
      if (!article.next) {
        next(); return;
      }
      article.next.prev = article.prev;
      article.next.save(function saved (err) {
        next(err);
      });
    }
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = remove;
