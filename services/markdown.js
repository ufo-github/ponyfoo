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

var options = {
  smartLists: true,
  ultralight: true,
  ultrasanitize: true,
  renderer: ultramarked.renderer({
    link: function (href, title, text) {
      return textService.format('<a href="%s"%s>%s</a>', href, getLabel(title), text);
    },
    image: function (href, title, text) {
      return textService.format('<img src="%s"%s alt="%s" />', href, getLabel(title), text);
    }
  }),
  iframes: []
};

module.exports = {
  compile: function (text) {
    return ultramarked(text, options);
  }
};
