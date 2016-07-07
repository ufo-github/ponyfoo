'use strict';

var winston = require('winston');
var sluggish = require('sluggish');
var KnownTag = require('../../../models/KnownTag');
var markupService = require('../../../services/markup');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  var editing = !!slug;
  if (slug) {
    KnownTag
      .findOne({ slug: slug })
      .exec(found);
  } else {
    updateAndSave(new KnownTag());
  }

  function found (err, tag) {
    if (err) {
      next(err); return;
    }
    if (!tag) {
      next('route'); return;
    }
    updateAndSave(tag);
  }

  function updateAndSave (tag) {
    var body = req.body;
    tag.slug = sluggish(body.slug);
    tag.title = body.title;
    tag.titleHtml = markupService.compile(body.title);
    tag.description = body.description;
    tag.descriptionHtml = markupService.compile(body.description);
    tag.save(saved);
  }

  function saved (err) {
    if (err) {
      winston.error(err);
    }
    res.redirect('/articles/tags/review');
  }
};
