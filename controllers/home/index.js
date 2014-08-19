'use strict';

var Article = require('../../models/Article');

module.exports = function (req, res, next) {
  var query = {
    status: 'published'
  };
  Article.find(query).sort('-publication').exec(handle);

  function handle (err, articles) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Pony Foo',
        articles: articles
      }
    };
    next();
  }
};
