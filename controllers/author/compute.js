'use strict';

var articleSearchService = require('../../services/articleSearch');

module.exports = function (req, res) {
  articleSearchService.addRelatedAll(completed);
  function completed () {
    res.redirect('/author/review');
  }
};
