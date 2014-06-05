'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var env = require('../../lib/env');
var ObjectId = mongoose.Schema.Types.ObjectId;
var fields = {
  targetId: { type: ObjectId, require: true },
  created: { type: Date, 'default': Date.now },
  expires: { type: Number, 'default': env('TOKEN_EXPIRES') },
  used: { type: Date, 'default': null }
};

function raw () {
  return _.cloneDeep(fields);
}

function model (name) {
  var schema = new mongoose.Schema(raw(), { id: false });
  return mongoose.model(name, schema);
}

module.exports = {
  raw: raw,
  model: model
};
