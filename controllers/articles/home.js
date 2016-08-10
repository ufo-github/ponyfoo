'use strict';

const articleService = require('../../services/article');
const articleListHandler = require('./lib/articleListHandler');

module.exports = function (req, res, next) {
  const limit = 40;
  const page = parseInt(req.params.page, 10) || 1;
  const query = { status: 'published' };
  const options = { limit: limit, skip: page * limit - limit, populate: 'author' };
  const handle = articleListHandler(res, { skip: false }, next);

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
