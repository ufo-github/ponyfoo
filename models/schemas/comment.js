'use strict';

var util = require('util');
var mongoose = require('mongoose');
var cryptoService = require('../../services/crypto');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  author: String,
  email: String,
  content: String,
  contentHtml: String,
  site: String,
  parent: { type: ObjectId, index: { unique: false }, ref: 'Comment' }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.virtual('gravatar').get(computeGravatar);

function computeGravatar () {
  var fmt = 'http://www.gravatar.com/avatar/%s?d=identicon&r=PG';
  var hash = cryptoService.md5(this.email);
  return util.format(fmt, hash);
}

module.exports = schema;
