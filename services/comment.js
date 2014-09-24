'use strict';

var _ = require('lodash');

function toJSON (comment) {
  return _.pick(comment, '_id', 'created', 'author', 'email', 'contentHtml', 'site', 'parent', 'gravatar');
}

module.exports = {
  toJSON: toJSON
};
