'use strict';

var util = require('util');
var Article = require('../../models/Article');
var listOrSingle = require('./listOrSingle');
var separator = /[+/,_:-]+/ig;

module.exports = function (req, res, next) {
  var tags = req.params.tags.split(separator);
  var query = {
    status: 'published',
    tags: { $all: tags }
  };
  var lastTag = tags.pop();
  var suffix = lastTag ? util.format('" and "%s', lastTag) : '';
  var tagNames = tags.join('", "') + suffix;
  var handle = listOrSingle(res, next);

  res.viewModel = {
    model: {
      title: util.format('Articles tagged "%s"', tagNames)
    }
  };

  Article.find(query).sort('-publication').exec(handle);
};
