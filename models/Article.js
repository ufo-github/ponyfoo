'use strict'

const mongoose = require(`mongoose`)
const commentSchema = require(`./schemas/comment`)
const ObjectId = mongoose.Schema.Types.ObjectId
const schema = new mongoose.Schema({
  author: { type: ObjectId, index: { unique: false }, require: true, ref: `User` },
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  updated: { type: Date, require: true, 'default': Date.now },
  publication: Date,
  status: { type: String, index: { unique: false }, require: true },
  title: String,
  titleMarkdown: String,
  titleHtml: String,
  slug: {
    type: String,
    index: { unique: true },
    require: true,
    set (value) {
      this._oldSlug = this.slug
      return value
    }
  },
  sign: String,
  heroImage: String,
  teaser: String,
  teaserHtml: String,
  editorNote: String,
  editorNoteHtml: String,
  introduction: String,
  introductionHtml: String,
  summary: String,
  summaryText: String,
  summaryHtml: String,
  body: String,
  bodyHtml: String,
  tags: [String],
  prev: { type: ObjectId, index: { unique: false }, ref: `Article` },
  next: { type: ObjectId, index: { unique: false }, ref: `Article` },
  related: [{ type: ObjectId, ref: `Article` }],
  comments: [commentSchema],
  email: { type: Boolean, 'default': true },
  tweet: { type: Boolean, 'default': true },
  fb: { type: Boolean, 'default': true },
  echojs: { type: Boolean, 'default': true },
  hn: { type: Boolean, 'default': true },
  hnDiscuss: String
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } })

const api = mongoose.model(`Article`, schema)

schema.index({
  tags: `text`,
  body: `text`,
  title: `text`,
  teaser: `text`,
  introduction: `text`
})
api.validStatuses = [`draft`, `publish`, `published`, `deleted`]
api.schema = schema

module.exports = api
