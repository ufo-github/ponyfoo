'use strict';

var authorOnly = require('./author/only');

module.exports = [
  { route: '/', action: 'home/index' },
  { route: '/account/login', action: 'account/login' },
  { route: '/author/compose', action: 'author/compose', middleware: authorOnly }
];
