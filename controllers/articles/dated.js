'use strict';

var _ = require('lodash');
var moment = require('moment');
var util = require('util');
var articleService = require('../../services/article');
var listOrSingle = require('./lib/listOrSingle');

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

function slug (params) {
  var fmt = 'YYYY/MM/DD';
  var keys = Object.keys(params).length;
  var parts = [params.year, params.month, params.day].splice(0, keys.length);
  return moment(parts.join('/'), fmt).format(fmt);
}

module.exports = function (req, res, next) {
  var parsed = parse(req.params);
  var handle = listOrSingle(res, { skip: false }, next);
  var titleFormat = 'Articles published on %s';
  var title = util.format(titleFormat, parsed.text);

  res.viewModel = {
    model: {
      title: title,
      meta: {
        canonical: '/articles/' + slug(req.params),
        description: 'This search results page contains all of the ' + title.toLowerCase()
      }
    }
  };

  var query = {
    status: 'published',
    publication: {
      $gte: parsed.start,
      $lt: parsed.end
    }
  };
  articleService.find(query, handle);
};
