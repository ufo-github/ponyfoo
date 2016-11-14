'use strict'

const _ = require(`lodash`)
const moment = require(`moment`)
const datetimeService = require(`./datetime`)
const env = require(`../lib/env`)
const autoclose = env(`AUTOCLOSE_COMMENTS`)

function toJSON (comment) {
  return {
    _id: comment._id.toString(),
    created: datetimeService.field(comment.created),
    author: comment.author,
    email: comment.email,
    contentHtml: comment.contentHtml,
    site: comment.site,
    parent: (comment.parent || ``).toString(),
    gravatar: comment.gravatar
  }
}

function hydrate (target, doc) {
  if (doc.populated && doc.populated(`comments`)) {
    target.commentThreads = doc.comments.sort(byPublication).reduce(threads, [])
  }
  target.commentCount = doc.comments ? doc.comments.length : 0
  target.commentOpen = !isClosed(doc)
  return target
}

function threads (accumulator, comment) {
  let thread
  const commentModel = toJSON(comment)
  if (commentModel.parent) {
    thread = _.find(accumulator, { id: commentModel.parent.toString() })
    thread.comments.push(commentModel)
  } else {
    thread = { id: commentModel._id.toString(), comments: [commentModel] }
    accumulator.push(thread)
  }
  return accumulator
}

function byPublication (a, b) {
  return a.created - b.created
}

function isClosed (host) {
  const autoclosing = moment(host.created).add(autoclose, `days`)
  const now = moment()
  return now.isAfter(autoclosing)
}

module.exports = {
  toJSON,
  hydrate,
  isClosed
}
