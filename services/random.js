'use strict';

var _ = require('lodash');
var contra = require('contra');

function find (Model, query, count, done) {
  contra.waterfall([
    function (next) {
      Model.find(query, '_id').lean().exec(next);
    },
    function (documents, next) {
      var random = _(documents).pluck('_id').sample(count).value();
      var byIds = {
        _id: { $in: random }
      };
      Model.find(byIds, next);
    }
  ], done);
}

module.exports = {
  find: find
};
