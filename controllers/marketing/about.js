'use strict';

const env = require('../../lib/env');
const staticService = require('../../services/static');
const markdownFileService = require('../../services/markdownFile');
const authority = env('AUTHORITY');
const aboutFile = './dat/about.md';

module.exports = function (req, res, next) {
  markdownFileService.read(aboutFile, respond);

  function respond (err, aboutHtml) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'About \u2014 Pony Foo',
        meta: {
          canonical: '/about',
          description: 'I love the web. I am a consultant, a conference speaker, the author of JavaScript Application Design, an opinionated blogger, and an open-source evangelist. I participate actively in the online JavaScript community — as well as offline in beautiful Buenos Aires.',
          images: [authority + staticService.unroll('/img/profile.jpg')]
        },
        aboutHtml: aboutHtml
      }
    };
    next();
  }
};
