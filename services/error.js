'use strict';

var env = require('../lib/env');
var cwd = env('CWD');

function toHtmlModel (error) {
  return divide(collapse(format(error)));
}

function format (error) {
  var root = new RegExp(cwd, 'ig');
  var rooted = error.replace(root, '~');
  return rooted;
}

function collapse (error) {
  return error.replace(/node_modules/ig, '<b>n</b>');
}

function divide (error) {
  return '<div class=\'lg-stack-start\'>' + error.split('\n').join('</div><div>') + '</div>';
}

module.exports = {
  toHtmlModel: toHtmlModel,
  toTextModel: format
};
