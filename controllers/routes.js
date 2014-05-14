'use strict';

var authorOnly = require('./author/only');

module.exports = [
  { route: '/', action: 'home/index' },
  { route: '/author/compose', action: 'author/compose', middleware: authorOnly }
];
