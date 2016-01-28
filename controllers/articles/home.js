'use strict';

var articleService = require('../../services/article');
var articleListHandler = require('./lib/articleListHandler');

module.exports = function (req, res, next) {
  var limit = 40;
  var page = parseInt(req.params.page, 10) || 1;
  var query = { status: 'published' };
  var options = { limit: limit, skip: page * limit - limit };
  var handle = articleListHandler(res, { skip: false }, next);

  res.viewModel = {
    model: {
      meta: {
        canonical: '/'
      },
      page: page,
      limit: limit
    }
  };

  articleService.find(query, options, handle);
};
