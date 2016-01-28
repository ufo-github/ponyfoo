'use strict';

var truncText = require('trunc-text');
var Presentation = require('../../models/Presentation');
var presentationService = require('../../services/presentation');
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
    var description = truncText(descriptionText, 170);
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
