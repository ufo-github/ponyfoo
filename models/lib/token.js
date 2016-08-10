'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const env = require('../../lib/env');
const ObjectId = mongoose.Schema.Types.ObjectId;
const fields = {
  targetId: { type: ObjectId, require: true },
  created: { type: Date, 'default': Date.now },
  expires: { type: Number, 'default': env('TOKEN_EXPIRES') },
  used: { type: Date, 'default': null }
};

function raw () {
  return _.cloneDeep(fields);
}

function model (name) {
  const schema = new mongoose.Schema(raw(), { id: false });
  return mongoose.model(name, schema);
}

module.exports = {
  raw: raw,
  model: model
};
