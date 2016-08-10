'use strict';

const inliningService = require('../../services/inlining');
const metadataService = require('../../services/metadata');
const articleService = require('../../services/article');
const cryptoService = require('../../services/crypto');
const userService = require('../../services/user');

module.exports = function (req, res, next) {
  const query = { slug: req.params.slug };
  const options = { populate: 'prev next related comments author' };
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
    const verify = req.query.verify;
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
    const model = res.viewModel.model;
    model.full = true;
    model.title = article.title;
    model.meta = {
      canonical: '/articles/' + article.slug,
      description: article.summaryText,
      keywords: article.tags,
      images: metadataService.extractImages(article).images
    };
    model.canEdit = userService.canEditArticle({
      userId: req.user,
      userRoles: req.userObject && req.userObject.roles,
      authorId: article.author._id,
      articleStatus: article.status
    });
    model.article = articleService.toJSON(article);
    inliningService.addStyles(res.viewModel.model, 'article');
    next();
  }
};
