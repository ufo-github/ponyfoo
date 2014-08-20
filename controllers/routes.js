'use strict';

var authorOnly = require('./author/only');

module.exports = [
  { route: '/', action: 'articles/home' },
  { route: '/articles/tags/:tags', action: 'articles/tagged' },
  { route: '/articles/:slug', action: 'articles/article' },
  { route: '/account/login', action: 'account/login' },
  { route: '/author/compose', action: 'author/compose', middleware: authorOnly },
  { route: '/author/compose/:slug', action: 'author/compose', middleware: authorOnly },
  { route: '/author/review', action: 'author/review', middleware: authorOnly }
];
