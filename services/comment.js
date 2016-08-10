'use strict';

const _ = require('lodash');
const datetimeService = require('./datetime');

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

function hydrate (target, doc) {
  if (doc.populated && doc.populated('comments')) {
    target.commentThreads = doc.comments.sort(byPublication).reduce(threads, []);
  }
  target.commentCount = doc.comments ? doc.comments.length : 0;
  return target;
}

function threads (accumulator, comment) {
  let thread;
  const commentModel = toJSON(comment);
  if (commentModel.parent) {
    thread = _.find(accumulator, { id: commentModel.parent.toString() });
    thread.comments.push(commentModel);
  } else {
    thread = { id: commentModel._id.toString(), comments: [commentModel] };
    accumulator.push(thread);
  }
  return accumulator;
}

function byPublication (a, b) {
  return a.created - b.created;
}

module.exports = {
  toJSON: toJSON,
  hydrate: hydrate
};
