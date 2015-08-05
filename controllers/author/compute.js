'use strict';

var Log = require('../../models/Log');
var articleSearchService = require('../../services/articleSearch');

module.exports = function (req, res, next) {
  articleSearchService.addRelatedAll(completed);
  function completed () {
    res.redirect('/author/review');
  }
};
