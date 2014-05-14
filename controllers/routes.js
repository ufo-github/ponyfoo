'use strict';

var author = require('./author');

module.exports = [{
  route: '/', action: 'home/index',
  route: '/author/compose', action: 'author/compose', middleware: author.only
}];


// binary to compile into:
/*module.exports = [{
  route: '/',
  template: require('../../.bin/views/home/index'),
  controller: require('./controllers/home/index')
}, {
  route: '/author/compose',
  template: require('../../.bin/views/author/compose'),
  controller: require('./controllers/author/compose')
},];
*/
