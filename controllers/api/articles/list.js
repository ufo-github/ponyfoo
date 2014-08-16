'use strict';

var Article = require('../../../models/Article');

module.exports = function (req, res, next) {
  var query = {};

  Article.find(query).lean().exec(handle);

  function handle (err, articles) {
    if (err) {
      next(err); return;
    }
    res.json({ articles: articles });
  }
};
