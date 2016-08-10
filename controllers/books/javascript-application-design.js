'use strict';

const env = require('../../lib/env');
const staticService = require('../../services/static');
const authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'JavaScript Application Design (2015) \u2014 Pony Foo',
      meta: {
        canonical: '/books/javascript-application-design',
        images: [
          authority + staticService.unroll('/img/javascript-application-design.jpg'),
          authority + staticService.unroll('/img/banners/branded.png')
        ],
        description: 'The fate of most applications is often sealed before a single line of code has been written. How is that possible? Simply, bad design assures bad results. Good design and effective processes are the foundation on which maintainable applications are built, scaled, and improved. For JavaScript developers, this means discovering the tooling, modern libraries, and architectural patterns that enable those improvements.'
      }
    }
  };
  next();
};
