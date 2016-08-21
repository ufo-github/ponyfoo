'use strict';

const articleSearchService = require(`../../services/articleSearch`);

module.exports = function (req, res) {
  articleSearchService.addRelatedAll(completed);
  function completed () {
    res.redirect(`/articles/review`);
  }
};
