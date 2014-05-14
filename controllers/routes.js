'use strict';

module.exports = [{
  route: '/', action: 'home/index',
  route: '/author/compose', action: ['author/only', 'author/compose']
}];
