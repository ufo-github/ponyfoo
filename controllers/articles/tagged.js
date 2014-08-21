'use strict';

var util = require('util');
var Article = require('../../models/Article');
var listOrSingle = require('./lib/listOrSingle');
var separator = /[+/,_: -]+/ig;

module.exports = function (req, res, next) {
  var tags = req.params.tags.split(separator);
  var query = {
    status: 'published',
    tags: { $all: tags }
  };
  var handle = listOrSingle(res, next);

  res.viewModel = {
    model: {
      title: util.format('Articles tagged "%s"', tags.join('", "'))
    }
  };

  Article.find(query).populate('prev next related').sort('-publication').exec(handle);
};
