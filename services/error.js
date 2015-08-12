'use strict';

var env = require('../lib/env');
var cwd = env('CWD');

function read (error) {
  if (!error) {
    return '(unknown)';
  }
  return typeof error === 'object' ? error.stack || error.message || '(unknown)' : error;
}

function toHtmlModel (error) {
  return divide(collapse(format(error)));
}

function format (error) {
  var root = new RegExp(cwd, 'ig');
  var rooted = read(error).replace(root, '~');
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
