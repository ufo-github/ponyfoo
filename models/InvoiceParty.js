'use strict'

const mongoose = require(`mongoose`)
const schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  title: String,
  slug: { type: String, index: { unique: true }, require: true },
  type: String, // ['customer', 'payment']
  name: String,
  details: String
})

module.exports = mongoose.model(`InvoiceParty`, schema)
