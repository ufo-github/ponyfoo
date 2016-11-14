'use strict'

const mongoose = require(`mongoose`)
const schema = new mongoose.Schema({
  start: Date,
  end: Date,
  conference: String,
  venue: String,
  location: String,
  website: String,
  tags: [String]
})

module.exports = mongoose.model(`Engagement`, schema)
