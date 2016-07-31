'use strict';

var but = require('but');
var contra = require('contra');
var Article = require('../../../models/Article');
var articleGitService = require('../../../services/articleGit');
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
      .populate('prev next')
      .exec(next);
  }

  function found (article, next) {
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    if (article.status !== 'draft' && !editor) {
      res.status(401).json({ messages: ['Only an editor can delete articles after they are published or scheduled.'] }); return;
    }
    contra.concurrent([removal, unlinkLeft, unlinkRight, gitRemoval], next);

    function removal (next) {
      article.remove(next);
    }

    function unlinkLeft (next) {
      if (!article.prev) {
        next(); return;
      }
      article.prev.next = article.next;
      article.prev.save(but(next);
    }

    function unlinkRight (next) {
      if (!article.next) {
        next(); return;
      }
      article.next.prev = article.prev;
      article.next.save(but(next);
    }

    function gitRemoval (next) {
      articleGitService.removeFromGit(article, next);
    }
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = remove;
