'use strict';

const mongoose = require(`mongoose`);
const gravatarService = require(`../../services/gravatar`);
const ObjectId = mongoose.Schema.Types.ObjectId;
const schema = new mongoose.Schema({
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  author: String,
  email: String,
  content: String,
  contentHtml: String,
  site: String,
  parent: { type: ObjectId, index: { unique: false }, ref: `Comment` }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.virtual(`gravatar`).get(computeGravatar);

function computeGravatar () {
  return gravatarService.format(this.email);
}

module.exports = schema;
