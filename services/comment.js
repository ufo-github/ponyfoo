'use strict';

function toJSON (comment) {
  return {
    _id: comment._id.toString(),
    created: comment.created,
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
