'use strict';

var metadataService = require('../../services/metadata');
var articleService = require('../../services/article');
var cryptoService = require('../../services/crypto');
var htmlService = require('../../services/html');
var textService = require('../../services/text');
var inliningService = require('../../services/inlining');

module.exports = function (req, res, next) {
  var query = { slug: req.params.slug };
  var options = { populate: 'prev next related comments author' };
  res.viewModel = {
    model: {
      title: 'Pony Foo'
    }
  };

  articleService.findOne(query, options, validate);

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
      handle(err, article);
    }

    function notFound () {
      handle(err, null);
    }
  }

  function handle (err, article) {
    if (err) {
      next(err); return;
    }
    if (!article) {
      res.viewModel.skip = true;
      next(); return;
    }
    var model = res.viewModel.model;
    model.full = true;
    model.title = article.title;
    model.meta = {
      canonical: '/articles/' + article.slug,
      description: article.summaryText,
      keywords: article.tags,
      images: metadataService.extractImages(article).images
    };
    model.article = articleService.toJSON(article);
    inliningService.addStyles(res.viewModel.model, 'article');
    next();
  }
};
