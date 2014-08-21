'use strict';

var articleService = require('../../../services/article');

module.exports = function (req, res, next) {
  articleService.refreshRelated(respond);

  function respond (err) {
    if (err) {
      next(err); return;
    }
    res.json(200, {});
  }
};
