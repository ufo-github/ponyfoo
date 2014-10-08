'use strict';

var articleSearchService = require('../../../services/articleSearch');

module.exports = function (req, res, next) {
  articleSearchService.refreshRelated(respond);

  function respond (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
};
