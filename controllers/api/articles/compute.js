'use strict';

var articleSearch = require('../../../services/articleSearch');

module.exports = function (req, res, next) {
  articleSearch.refreshRelated(respond);

  function respond (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
};
