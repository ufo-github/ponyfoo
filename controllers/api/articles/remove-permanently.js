'use strict';

const but = require('but');
const contra = require('contra');
const Article = require('../../../models/Article');
const userService = require('../../../services/user');
const editorRoles = ['owner', 'editor'];

function remove (req, res, next) {
  const editor = userService.hasRole(req.userObject, editorRoles);

  contra.waterfall([lookupArticle, found], handle);

  function lookupArticle (next) {
    const query = { slug: req.params.slug };
    if (!editor) {
      query.author = req.user;
    }
    Article
      .findOne(query)
      .exec(next);
  }

  function found (article, next) {
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    if (article.status !== 'deleted') {
      res.status(401).json({ messages: ['Articles must be moved to trash before they can be permanently deleted.'] }); return;
    }
    article.remove(but(next));
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = remove;
