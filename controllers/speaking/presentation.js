'use strict';

var Presentation = require('../../models/Presentation');
var presentationService = require('../../services/presentation');
var textService = require('../../services/text');
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
    var description = textService.truncate(descriptionText, 170);
    var model = presentationService.toModel(presentation);
    model.standalone = true;
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
