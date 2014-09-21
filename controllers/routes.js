'use strict';

var authOnly = require('./account/only');
var authorOnly = require('./author/only');

module.exports = [
  { route: '/', action: 'articles/home' },
  { route: '/articles', action: 'articles/redirectHome' },
  { route: '/articles/feed', ignore: true },
  { route: '/articles/archives', action: 'articles/archives' },
  { route: '/articles/tagged/:tags', action: 'articles/tagged' },
  { route: '/articles/search/:terms', action: 'articles/search' },
  { route: '/articles/search/:terms/tagged/:tags', action: 'articles/searchTagged' },
  { route: '/articles/:year(\\d{4})/:month([01]\\d)/:day([0-3]\\d)', action: 'articles/dated' },
  { route: '/articles/:year(\\d{4})/:month([01]\\d)', action: 'articles/dated' },
  { route: '/articles/:year(\\d{4})', action: 'articles/dated' },
  { route: '/articles/:slug', action: 'articles/article' },
  { route: '/account/login', action: 'account/login' },
  { route: '/account/logout', ignore: true },
  { route: '/account/bio', action: 'account/bio', middleware: authOnly },
  { route: '/author/compose', action: 'author/compose', middleware: authorOnly },
  { route: '/author/compose/:slug', action: 'author/compose', middleware: authorOnly },
  { route: '/author/review', action: 'author/review', middleware: authorOnly },
  { route: '/*', action: 'error/not-found' }
];
