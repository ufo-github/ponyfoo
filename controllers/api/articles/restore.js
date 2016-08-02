'use strict';

var but = require('but');
var contra = require('contra');
var Article = require('../../../models/Article');
var userService = require('../../../services/user');
var editorRoles = ['owner', 'editor'];

function remove (req, res, next) {
  var editor = userService.hasRole(req.userObject, editorRoles);

  contra.waterfall([lookupArticle, found], handle);

  function lookupArticle (next) {
    var query = { slug: req.params.slug };
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
    if (article.status !== 'draft' && !editor) {
      res.status(401).json({ messages: ['Only an editor can restore articles after they are moved to the trash.'] }); return;
    }
    article.status = 'draft';
    article.save(but(next));
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = remove;
