'use strict';

var contra = require('contra');
var Article = require('../../../models/Article');
var respond = require('../lib/respond');
var validate = require('./lib/validate');
var publish = require('./lib/publish');

module.exports = function (req, res, next) {
  var body = req.body;
  var validation = validate(req.body);
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
    function update (next) {
      Article.update({ slug: req.params.slug }, model, next);
    }
  ], respond(res, validation, next));
};
