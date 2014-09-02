'use strict';

var contra = require('contra');
var Article = require('../../../models/Article');
var articleService = require('../../../services/article');
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
  var broadcast = false;

  contra.waterfall([
    function statusUpdate (next) {
      publish(model, next);
    },
    function lookup (published, next) {
      broadcast = published;
      Article.findOne({ slug: req.params.slug }, next);
    },
    function found (article, next) {
      if (!article) {
        res.json(404, { messages: ['Article not found'] }); return;
      }
      Object.keys(model).forEach(function (key) {
        article[key] = model[key];
      });
      article.save(saved);

      function saved (err) {
        if (!err && broadcast) {
          articleService.campaign(article);
        }
        next(err);
      }
    }
  ], function response (err) {
    respond(err, res, next, validation);
  });
};
