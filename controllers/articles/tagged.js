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
    var lastTag = tags.pop();
    var suffix = lastTag ? util.format('" and "%s', lastTag) : '';
    var tagNames = tags.join('", "') + suffix;
    res.viewModel = {
      model: {
        action: 'articles/list',
        title: util.format('Articles tagged "%s"', tagNames),
        articles: articles
      }
    };
    next();
  }
};
