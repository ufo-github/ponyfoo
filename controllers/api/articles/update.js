'use strict';

var contra = require('contra');
var Article = require('../../../models/Article');
var respond = require('../lib/respond');
var validate = require('./lib/validate');
var publish = require('./lib/publish');

module.exports = function (req, res, next) {
  var body = req.body;
  var validation = validate(req.body, true);
  if (validation.length) {
    respond.invalid(res, validation); return;
  }
  var model = validation.model;

  contra.waterfall([
    function statusUpdate (next) {
      if (model.status === 'publish' && !model.publication) {
        publish(model, next);
      } else {
        next();
      }
    },
    function lookup (next) {
      Article.findOne({ slug: req.params.slug }, next);
    },
    function (article, next) {
      if (!article) {
        res.json(404, { messages: ['Article not found'] }); return;
      }
      Object.keys(model).forEach(function (key) {
        article[key] = model[key];
      });
      article.save(next);
    }
  ], respond(res, validation, next));
};
