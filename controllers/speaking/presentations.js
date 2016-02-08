'use strict';

var _ = require('lodash');
var Presentation = require('../../models/Presentation');
var presentationService = require('../../services/presentation');

module.exports = function (req, res, next) {
  Presentation.find({}).sort('-presented').exec(function (err, presentations) {
    if (err) {
      next(err); return;
    }
    if (!presentations.length) {
      res.viewModel = { skip: true };
      next(); return;
    }
    var images = _.flatten(presentations.map(presentationService.toCovers));
    res.viewModel = {
      model: {
        title: 'Conference Presentations \u2014 Pony Foo',
        presentations: presentations.map(presentationService.toModel),
        meta: {
          images: images,
          description: 'Delivering a talk on something I\'m passionate about is fun and exciting. I enjoy speaking about all things JavaScript, performance, maintainable code, and the open web.\n\nI\'ve delivered workshops on web performance before and I\'m also interested in delivering workshops on ES6 as well as all things JavaScript. If you\'d like to discuss the possibility of me running a workshop at your event, please use the contact button below and shoot me an email!'
        }
      }
    };
    next();
  });
};
