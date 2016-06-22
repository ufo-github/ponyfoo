'use strict';

var env = require('../../lib/env');
var staticService = require('../../services/static');
var markdownFileService = require('../../services/markdownFile');
var authority = env('AUTHORITY');
var aboutFile = './dat/license.md';

module.exports = function (req, res, next) {
  markdownFileService.read(aboutFile, respond);

  function respond (err, licenseHtml) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'License \u2014 Pony Foo',
        meta: {
          canonical: '/license'
        },
        licenseHtml: licenseHtml
      }
    };
    next();
  }
};
