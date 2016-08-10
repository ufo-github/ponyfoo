'use strict';

const Article = require('../../models/Article');
const randomService = require('../../services/random');
const redirect = require('./lib/redirect');

module.exports = function (req, res, next) {
  randomService.find(Article, { status: 'published' }, 1, redirect(res, next));
};
