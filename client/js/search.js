'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var input = $('.sr-input');
var button = $('.sr-button');
var spaces = /\s+/;
var rtag = /^\[(\S+)\]$/;

button.on('click', search);

function search () {
  var builder = ['/articles'];
  var keywords = input.value().trim().split(spaces);
  var tags = keywords.filter(tag);
  var terms = keywords.reduce(noTags, []);
  if (terms.length) {
    builder.push('/search/');
    builder.push(terms.join('-'));
  }
  if (tags.length) {
    builder.push('/tagged/');
    builder.push(tags.map(unwrap).join('+'));
  }
  taunus.navigate(builder.join(''));

  function noTags (terms, term) {
    if (tags.indexOf(term) === -1) {
      terms.push(term);
    }
    return terms;
  }
}

function tag (term) {
  return rtag.test(term);
}

function unwrap (tag) {
  return tag.replace(rtag, '$1');
}
