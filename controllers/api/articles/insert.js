'use strict';

var contra = require('contra');
var util = require('util');
var moment = require('moment');
var validator = require('validator');
var Article = require('../../../models/Article');
var articleService = require('../../../services/article');
var textService = require('../../../services/text');
var respond = require('../lib/respond');
var validate = require('./lib/validate');
var publish = require('./lib/publish');

module.exports = function (req, res, next) {
  var body = req.body;
  var validation = validate(body);
  if (validation.length) {
    respond.invalid(res, validation); return;
  }
  var model = new Article(validation.model);

  contra.waterfall([
    function lookupSlug (next) {
      Article.findOne({ slug: model.slug }, next);
    },
    function validateSlug (article, next) {
      if (article) {
        validation.push('The slug you provided is already in use. Please change it.');
      }
      next(validation.length);
    },
    function statusUpdate (next) {
      publish(model, next);
    },
    function insert (published, next) {
      model.save(function saved (err) {
        if (!err && published) {
          articleService.campaign(model);
        }
        next(err);
      });
    }
  ], function response (err) {
    respond(err, res, next, validation);
  });
};
