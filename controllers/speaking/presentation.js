'use strict';

var truncText = require('trunc-text');
var Presentation = require('../../models/Presentation');
var presentationService = require('../../services/presentation');
var htmlService = require('../../services/html');

module.exports = function (req, res, next) {
  Presentation.findOne({ slug: req.params.slug }, function (err, presentation) {
    if (err) {
      next(err); return;
    }
    if (!presentation) {
      res.viewModel = { skip: true };
      next(); return;
    }
    var descriptionText = htmlService.getText(presentation.descriptionHtml);
    var description = truncText(descriptionText, 170);
    var model = presentationService.toModel(presentation);
    res.viewModel = {
      model: {
        title: presentation.title,
        presentation: model,
        meta: {
          description: description
        }
      }
    };
    next();
  });
};
