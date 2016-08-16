'use strict';

const _ = require(`lodash`);
const articleService = require(`../../../services/article`);
const cryptoService = require(`../../../services/crypto`);
const userService = require(`../../../services/user`);
const editorRoles = [`owner`, `editor`];

module.exports = getModel;

function getModel (req, res, next) {
  const editor = userService.hasRole(req.userObject, editorRoles);
  const query = {};
  if (!editor) {
    query.author = req.user;
  }
  const opts = {
    populate: [[`author`, `twitter website displayName slug email avatar`]]
  };
  articleService.find(query, opts, respond);

  function respond (err, articles) {
    if (err) {
      next(err); return;
    }
    const models = articles
      .map(article => articleService.toJSON(article, { meta: true }))
      .map(model => {
        if (model.status !== `published`) {
          model.permalink += `?verify=` + cryptoService.md5(model._id + model.created);
        }
        return model;
      });
    const sorted = _.sortBy(models, sortByStatus);
    res.viewModel = {
      model: {
        title: `Article Review`,
        meta: {
          canonical: `/articles/review`
        },
        articles: sorted,
        userIsEditor: editor
      }
    };
    next();
  }
}

function sortByStatus (article) {
  return { draft: 0, publish: 1, published: 2 }[article.status];
}
