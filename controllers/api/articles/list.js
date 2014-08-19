'use strict';

var Article = require('../../../models/Article');

module.exports = function (req, res, next) {
  var query = {};

  Article.find(query).sort('-publication').exec(handle);

  function handle (err, articles) {
    if (err) {
      next(err); return;
    }
    res.json(200, { articles: articles });
  }
};
