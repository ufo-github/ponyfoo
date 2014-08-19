'use strict';

var util = require('util');

module.exports = [{
  src: 'client/img/icons/**/*.{png,gif,jpg}',
  destImage: '.bin/public/img/icons.png',
  destCSS: 'client/css/generated/icons.css',
  imgPath: '/img/icons.png',
  cssOpts: {
    cssClass: function (item) {
      return util.format('.ic-%s:before', item.name);
    }
  }
}];
