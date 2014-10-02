'use strict';

var Article = require('../../models/Article');
var randomService = require('../../services/random');
var redirect = require('./lib/redirect');

module.exports = function (req, res, next) {
  randomService.find(Article, { status: 'published' }, 1, redirect(res, next));
};
