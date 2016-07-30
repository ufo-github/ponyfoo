'use strict';

var winston = require('winston');

function pushArticles (req, res, next) {
  winston.info('Received a push notification from GitHub.', req.body);
  res.end();
}

module.exports = pushArticles;
