'use strict';

var author = require('./author');

module.exports = [{
  route: '/', action: 'home/index',
  route: '/author/compose', action: 'author/compose', middleware: author.only
}];
