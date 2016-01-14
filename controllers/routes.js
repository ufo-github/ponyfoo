'use strict';

var authOnly = require('./account/only');
var authorOnly = require('./author/only');

module.exports = [
  { route: '/', action: 'articles/home' },
  { route: '/p/:page([1-9][0-9]{0,})', action: 'articles/home' },
  { route: '/articles/feed', ignore: true },
  { route: '/articles/history', action: 'articles/history' },
  { route: '/articles/archives', ignore: true },
  { route: '/articles/first', action: 'articles/first' },
  { route: '/articles/last', action: 'articles/last' },
  { route: '/articles/random', action: 'articles/random' },
  { route: '/articles/tagged/:tags', action: 'articles/tagged' },
  { route: '/articles/search/:terms', action: 'articles/search' },
  { route: '/articles/search/:terms/tagged/:tags', action: 'articles/searchTagged' },
  { route: '/articles/:year(\\d{4})/:month([01]\\d)/:day([0-3]\\d)', action: 'articles/dated' },
  { route: '/articles/:year(\\d{4})/:month([01]\\d)', action: 'articles/dated' },
  { route: '/articles/:year(\\d{4})', action: 'articles/dated' },
  { route: '/articles/:slug', action: 'articles/article' },
  { route: '/talks', action: 'talks/home' },
  { route: '/account/login', action: 'account/login' },
  { route: '/account/login/:provider', ignore: true },
  { route: '/account/logout', ignore: true },
  { route: '/account/bio', action: 'account/bio', middleware: authOnly },
  { route: '/author/compose', action: 'author/compose', middleware: authorOnly },
  { route: '/author/compose/:slug', action: 'author/compose', middleware: authorOnly },
  { route: '/author/email', action: 'author/email', middleware: authorOnly },
  { route: '/author/review', action: 'author/review', middleware: authorOnly },
  { route: '/author/logs/:page([1-9][0-9]{0,})?', action: 'author/logs', middleware: authorOnly },
  { route: '/author/subscribers', action: 'author/subscribers', middleware: authorOnly },
  { route: '/subscribe', action: 'marketing/subscribe' },
  { route: '/offline', action: 'error/offline' },
  { route: '/*', action: 'error/not-found' }
];
