'use strict'

const mongoose = require(`mongoose`)
const schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  presented: Date,
  title: String,
  slug: String,
  description: String,
  descriptionHtml: String,
  youtube: String,
  vimeo: String,
  speakerdeck: String,
  resources: [{
    title: String,
    titleHtml: String,
    url: String
  }]
})

module.exports = mongoose.model(`Presentation`, schema)
