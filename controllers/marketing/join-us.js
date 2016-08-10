'use strict';

var env = require('../../lib/env');
var staticService = require('../../services/static');
var markdownFileService = require('../../services/markdownFile');
var authority = env('AUTHORITY');
var guidelinesFile = './dat/contributing-guidelines.md';

module.exports = function (req, res, next) {
  markdownFileService.read(guidelinesFile, respond);

  function respond (err, guidelines) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Join Our Team! \u2014 Pony Foo',
        meta: {
          canonical: '/contributors/join-us',
          description: 'Join the contributors and writers collaborating on Pony Foo!',
          images: [authority + staticService.unroll('/img/articles.png')]
        },
        guidelines: guidelines
      }
    };
    next();
  }
};
