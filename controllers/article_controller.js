'use strict';

var Article = require('../models/Article');

module.exports = {
  getList: function (req, res, err) {
    var query = {};

    Article.find(query).lean().exec(handle);

    function handle (err, articles) {
      if (err) {
        next(err); return;
      }
      res.json({ articles: articles });
    }
  }
};
