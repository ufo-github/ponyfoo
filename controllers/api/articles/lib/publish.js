'use strict';

var contra = require('contra');
var Article = require('../../../../models/Article');

function publish (model, done) {
  contra.waterfall([
    function lookupPrevious (next) {
      Article.findOne({ status: 'published' }).sort('-publication').exec(next);
    },
    function insertArticle (prev, next) {
      if (prev) {
        model.prev = prev._id;
      }
      model.publication = Date.now();
      model.status = 'published';

      next(null, prev);
    },
    function updatePrevious (prev, next) {
      if (!prev) {
        next(); return;
      }
      prev.next = model._id;
      prev.save(function saved (err) {
        next(err);
      });
    }
  ], done);
}

module.exports = publish;
