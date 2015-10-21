'use strict';

var datetimeService = require('./datetime');

function toJSON (comment) {
  return {
    _id: comment._id.toString(),
    created: datetimeService.field(comment.created),
    author: comment.author,
    email: comment.email,
    contentHtml: comment.contentHtml,
    site: comment.site,
    parent: (comment.parent || '').toString(),
    gravatar: comment.gravatar,
  };
}

module.exports = {
  toJSON: toJSON
};
