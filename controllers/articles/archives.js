'use strict';

var taunus = require('taunus');
var httpService = require('../../services/http');

module.exports = function (req, res) {
  httpService.redirect(req, res, taunus.resolve('articles/history'), { hard: true });
};
