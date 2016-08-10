'use strict';

const _ = require('lodash');
const moment = require('moment');
const util = require('util');
const articleService = require('../../services/article');
const articleListHandler = require('./lib/articleListHandler');

function parse (params) {
  const formats = ['YYYY', 'MM', 'DD'];
  const parts = _.values(params);
  const len = parts.length;
  const input = parts.join('-');
  const inputFormat = formats.slice(0, len).join('-');
  let unit;
  let textual;

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

  const when = moment.utc(input, inputFormat);
  const text = when.format(textual);

  return {
    start: when.startOf(unit).toDate(),
    end: when.clone().endOf(unit).toDate(),
    text: text
  };
}

function slug (params) {
  const fmt = 'YYYY/MM/DD';
  const keys = Object.keys(params).length;
  const parts = [params.year, params.month, params.day].splice(0, keys.length);
  return moment.utc(parts.join('/'), fmt).format(fmt);
}

module.exports = function (req, res, next) {
  const parsed = parse(req.params);
  const handle = articleListHandler(res, { skip: false }, next);
  const titleFormat = 'Articles published on %s';
  const title = util.format(titleFormat, parsed.text);

  res.viewModel = {
    model: {
      title: title,
      meta: {
        canonical: '/articles/' + slug(req.params),
        description: 'This search results page contains all of the ' + title.toLowerCase()
      }
    }
  };

  const query = {
    status: 'published',
    publication: {
      $gte: parsed.start,
      $lt: parsed.end
    }
  };
  articleService.find(query, handle);
};
