'use strict';

var fs = require('fs');
var contra = require('contra');
var env = require('../../lib/env');
var markupService = require('../../services/markup');
var staticService = require('../../services/static');
var cached;

module.exports = function (req, res, next) {
  if (cached) {
    respond(null, cached); return;
  }
  contra.waterfall([
    function readFile (next) {
      fs.readFile('./dat/contributing-guidelines.md', 'utf8', next);
    },
    function compileMarkdown (md, next) {
      cached = markupService.compile(md);
      next(null, cached);
    }
  ], respond)


  function respond (err, guidelines) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Join Our Team! \u2014 Pony Foo',
        meta: {
          canonical: '/contributors/join-us',
          description: 'Join the contributors and writers collaborating on Pony Foo!'
        },
        guidelines: guidelines
      }
    };
    next();
  }
}
