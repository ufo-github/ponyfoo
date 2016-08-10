'use strict';

const spaces = /\s+/;

function compile (input) {
  const builder = ['/articles'];
  const keywords = (input || '').trim().split(spaces).filter(truthy);
  const extracted = { tags: [], terms: [] };

  keywords.reduce(extract, extracted);
  extracted.tags = clean(extracted.tags);
  extracted.terms = clean(extracted.terms);

  if (extracted.terms.length) {
    builder.push('/search/');
    builder.push(extracted.terms.join('-'));
  }
  if (extracted.tags.length) {
    builder.push('/tagged/');
    builder.push(extracted.tags.map(unwrap).join('+'));
  }
  return builder.length > 1 ? builder.join('') : null;
}

function extract (result, keyword) {
  const tagExtract = /\[([^\s[\]]+)\]/g;
  const tags = keyword.match(tagExtract);
  if (tags) {
    result.tags.push.apply(result.tags, tags);
  }
  const terms = [keyword];
  let edge;
  let splicer;
  let split;
  while (tags && tags.length) {
    edge = terms.length - 1;
    split = terms[edge].split(tags.shift());
    splicer = [edge, 1].concat(split);
    terms.splice.apply(terms, splicer);
  }
  result.terms.push.apply(result.terms, terms);
  return result;
}

function clean (collection) {
  return collection.filter(truthy).reduce(unique, []);
}

function truthy (keyword) {
  return !!keyword;
}

function unique (collection, item) {
  if (collection.indexOf(item) === -1) {
    collection.push(item);
  }
  return collection;
}

function unwrap (tag) {
  const tagUnwrap = /^\[(\S+)\]$/;
  return tag.replace(tagUnwrap, '$1');
}

module.exports = {
  compile: compile
};
