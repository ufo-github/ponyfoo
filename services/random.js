'use strict';

const _ = require(`lodash`);
const contra = require(`contra`);

function find (Model, query, count, done) {
  if (count === 1) {
    single();
  } else {
    many();
  }

  function single () {
    contra.waterfall([
      function (next) {
        Model.find(query).count(next);
      },
      function (count, next) {
        const skips = Math.floor(Math.random() * count);
        Model.find(query).skip(skips).limit(1).exec(next);
      }
    ], done);
  }

  function many () {
    contra.waterfall([
      next => Model.find(query).select(`_id`).lean().exec(next),
      (documents, next) => next(null, _(documents).map(`_id`).sampleSize(count).value()),
      ($in, next) => Model.find({ _id: { $in } }, next)
    ], done);
  }
}

module.exports = { find };
