'use strict';

var _ = require('lodash');
var moment = require('moment');
var util = require('util');
var Article = require('../../models/Article');
var listOrSingle = require('./lib/listOrSingle');
var separator = /[+/,_: -]+/ig;

function parse (params) {
  var formats = ['YYYY', 'MM', 'DD'];
  var parts = _.values(params);
  var len = parts.length;
  var input = parts.join('-');
  var inputFormat = formats.slice(0, len).join('-');
  var unit;
  var textual;

  if (params.day) {
    textual = 'MMMM Do, YYYY';
    unit = 'day';
  } else if (params.month) {
    textual = 'MMMM, YYYY';
    unit = 'month';
  } else {
    textual = 'YYYY';
    unit = 'year';
  }

  var when = moment(input, inputFormat);
  var text = when.format(textual);

  return {
    start: when.startOf(unit).toDate(),
    end: when.clone().endOf(unit).toDate(),
    text: text
  };
}

module.exports = function (req, res, next) {
  var parsed = parse(req.params);
  var handle = listOrSingle(res, next);
  var titleFormat = 'Articles published on %s';
  var title = util.format(titleFormat, parsed.text);

  res.viewModel = {
    model: {
      title: title
    }
  };

  var query = {
    status: 'published',
    publication: {
      $gte: parsed.start,
      $lt: parsed.end
    }
  };
  Article.find(query).sort('-publication').exec(handle);
};
