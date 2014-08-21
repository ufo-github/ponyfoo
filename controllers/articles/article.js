'use strict';

var Article = require('../../models/Article');

module.exports = function (req, res, next) {
  var query = {
    status: 'published',
    slug: req.params.slug
  };
  Article.findOne(query).populate('prev next related').exec(handle);

  function handle (err, article) {
    if (err) {
      next(err); return;
    }
    if (!article) {
      res.json(404, { messages: ['Article not found'] }); return;
    }
    res.viewModel = {
      model: {
        title: article.title,
        article: article,
        full: true
      }
    };
    next();
  }
};
