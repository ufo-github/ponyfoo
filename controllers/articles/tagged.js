'use strict';

var util = require('util');
var Article = require('../../models/Article');
var separator = /[+/,_:-]+/ig;

module.exports = function (req, res, next) {
  var tags = req.params.tags.split(separator);
  var query = {
    status: 'published',
    tags: { $all: tags }
  };
  Article.find(query).sort('-publication').exec(handle);

  function handle (err, articles) {
    if (err) {
      next(err); return;
    }
    var article = articles.length === 1 ? articles[0] : false;
    var lastTag = tags.pop();
    var suffix = lastTag ? util.format('" and "%s', lastTag) : '';
    var tagNames = tags.join('", "') + suffix;
    var model = {
      action: article ? 'articles/article' : 'articles/list',
      title: util.format('Articles tagged "%s"', tagNames)
    };
    model[data] = article || articles;
    res.viewModel = { model: model };
    next();
  }
};
