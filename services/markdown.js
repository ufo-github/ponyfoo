'use strict';

var ultramarked = require('ultramarked');
var textService = require('./text');

function getLabel (title) {
  var trimmedTitle = title ? title.trim() : '';
  if (trimmedTitle) {
    return textService.format(' aria-label="%s"', trimmedTitle);
  }
  return '';
}

function link (href, title, text) {
  return textService.format('<a href="%s"%s>%s</a>', href, getLabel(title), text);
}

function image (href, title, text) {
  return textService.format('<img src="%s"%s alt="%s" />', href, getLabel(title), text);
}

var iframes = [
  'http://codepen.io/',
  'http://jsbin.com/',
  'http://jsfiddle.net/',
  'http://embed.plnkr.co/'
];

var options = {
  smartLists: true,
  ultralight: true,
  ultrasanitize: true,
  iframes: iframes,
  renderer: ultramarked.renderer({
    link: link,
    image: image
  })
};

module.exports = {
  compile: function (text) {
    return ultramarked(text, options);
  }
};
