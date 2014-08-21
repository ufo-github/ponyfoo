'use strict';

var Article = require('../models/Article');

function find (query, options, next) {
  if (next === void 0) {
    next = options; options = {};
  }
  if (!options.populate) { options.populate = 'prev next related'; }
  if (!options.sort) { options.sort = '-publication'; }

  var cursor = Article.find(query);

  if (options.populate) {
    cursor = cursor.populate(options.populate);
  }
  if (options.sort) {
    cursor = cursor.sort(options.sort);
  }
  cursor.exec(next);
}

module.exports = {
  find: find
};
