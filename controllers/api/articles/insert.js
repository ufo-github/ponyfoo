'use strict';

var contra = require('contra');
var util = require('util');
var moment = require('moment');
var validator = require('validator');
var Article = require('../../../models/Article');
var textService = require('../../../services/text');
var respond = require('../lib/respond');
var validate = require('./lib/validate');
var publish = require('./lib/publish');

module.exports = function (req, res, next) {
  var body = req.body;
  var validation = validate(req.body);
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
      if (model.status === 'publish' && !model.publication) {
        publish(model, next);
      } else {
        next();
      }
    },
    function insert (next) {
      model.save(function saved (err) {
        next(err);
      });
    }
  ], respond(res, validation, next));
};
