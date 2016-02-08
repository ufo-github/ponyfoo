'use strict';

var env = require('../../lib/env');
var staticService = require('../../services/static');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Books written by Nicolás Bevacqua \u2014 Pony Foo',
      meta: {
        images: [
          authority + staticService.unroll('/img/javascript-application-design.jpg'),
          authority + staticService.unroll('/img/thumbnail.png')
        ],
        description: 'I started blogging around early 2013. Over half a year later I became increasingly interested in writing a book, and that interest eventually materialized as my first book: JavaScript Application Design. You can find out more about the book by clicking on its cover. As new book projects are announced they\'ll be added to this page so that you can learn more about them.'
      }
    }
  };
  next();
};
