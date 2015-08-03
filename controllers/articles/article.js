'use strict';

var articleService = require('../../services/article');
var cryptoService = require('../../services/crypto');
var listOrSingle = require('./lib/listOrSingle');

module.exports = function (req, res, next) {
  var handle = listOrSingle(res, next);
  var query = {
    slug: req.params.slug
  };

  res.viewModel = {
    model: {
      title: 'Pony Foo'
    }
  };

  articleService.findOne(query, validate);

  function validate (err, article) {
    if (err || !article) {
      notFound(); return;
    }
    if (article.status === 'published') {
      done(); return;
    }

    // draft share link?
    var verify = req.query.verify;
    if (verify && verify === cryptoService.md5(article._id + article.created)) {
      done(); return;
    }

    // not found!
    notFound();

    function done () {
      handle(err, [article]);
    }

    function notFound () {
      handle(err, []);
    }
  }
};
