'use strict';

var Presentation = require('../../models/Presentation');
var presentationService = require('../../services/presentation');
var textService = require('../../services/text');
var htmlService = require('../../services/html');

module.exports = function (req, res, next) {
  Presentation.find({}).sort('-presented').exec(function (err, presentations) {
    if (err) {
      next(err); return;
    }
    if (!presentations.length) {
      res.viewModel = { skip: true };
      next(); return;
    }
    var latest = presentations[0];
    var descriptionText = htmlService.getText(latest.descriptionHtml);
    var description = textService.truncate(descriptionText, 170);
    res.viewModel = {
      model: {
        title: 'Conference Presentations \u2014 Pony Foo',
        presentations: presentations.map(presentationService.toModel),
        meta: {
          description: description
        }
      }
    };
    next();
  });
};
