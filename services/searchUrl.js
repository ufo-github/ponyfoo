'use strict';

var spaces = /\s+/;
var rtag = /^\[(\S+)\]$/;

function compile (input) {
  var builder = ['/articles'];
  var keywords = (input || '').trim().split(spaces).filter(truthy);
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
  return builder.length > 1 ? builder.join('') : null;

  function noTags (terms, term) {
    if (tags.indexOf(term) === -1) {
      terms.push(term);
    }
    return terms;
  }
}

function truthy (term) {
  return !!term;
}

function tag (term) {
  return rtag.test(term);
}

function unwrap (tag) {
  return tag.replace(rtag, '$1');
}

module.exports = {
  compile: compile
};
