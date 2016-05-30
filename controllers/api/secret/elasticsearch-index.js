'use strict';

var winston = require('winston');
var indexService = require('../../../services/articleElasticsearchIndex');

function ensure (req, res, next) {
  winston.debug('Ensuring elasticsearch index exists.');
  indexService.ensureIndex(ensured);
  function ensured (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = ensure;
