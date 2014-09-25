'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var winston = require('winston');
var Article = require('../../../../models/Article');
var User = require('../../../../models/User');
var validate = require('./validate');
var respond = require('../../lib/respond');
var commentService = require('../../../../services/comment');
var htmlService = require('../../../../services/html');
var gravatarService = require('../../../../services/gravatar');
var subscriberService = require('../../../../services/subscriber');
var markdownFatService = require('../../../../services/markdownFat');

module.exports = function (slug, input, done) {
  var validation = validate(input);
  if (validation.length) {
    done(null, 400, validation); return;
  }
  var model = validation.model;
  var comment;

  contra.waterfall([findArticle, decisionTree, create], created);

  function findArticle (next) {
    Article.findOne({ slug: slug }).populate('comments').exec(next);
  }

  function decisionTree (article, next) {
    if (!article) {
      done(null, 404, ['Article not found']); return;
    }
    next(null, article);
  }

  function create (article, next) {
    var parent;
    var parentId = model.parent;
    if (parentId) {
      parent = article.comments.id(parentId);
      if (!parent) {
        done(null, 404, ['The comment thread has been deleted!']); return;
      }
      if (parent.parent) {
        done(null, 400, ['Comments can\'t be nested that deep!']); return;
      }
    }
    model.contentHtml = markdownFatService.compileExternalizeLinks(model.content);
    comment = article.comments.create(model);
    article.comments.push(comment);
    article.save(saved);

    function saved (err) {
      if (!err) {
        subscriberService.add({
          email: comment.email,
          name: comment.author,
          source: 'comment'
        });
        notify(article);
      }
      next(err);
    }
  }

  function notify (article) {
    contra.concurrent({
      recipients: contra.curry(findRecipients, article),
      html: absolutizeHtml,
      gravatar: fetchGravatar
    }, function prepare (err, data) {
      data.article = article;
      send(err, data);
    });
  }

  function findRecipients (article, next) {
    contra.waterfall([hydrate, calculate], next);

    function hydrate (next) {
      article.populate('author', next);
    }

    function calculate (article, next) {
      var emails = [article.author.email];
      var thread, op;
      var parentId = comment.parent;
      if (parentId) {
        op = article.comments.id(parentId);
        thread = article.comments.filter(sameThread);
        thread.unshift(op);
        emails = emails.concat(_.pluck(thread, 'email'));
      }
      function sameThread (comment) {
        return comment.parent && comment.parent.equals(parentId);
      }
      next(null, _(emails).uniq().without(comment.email).value());
    }
  }

  function absolutizeHtml (next) {
    htmlService.absolutize(comment.contentHtml, next);
  }

  function fetchGravatar (next) {
    gravatarService.fetch(comment.email, function (err, gravatar) {
      if (err) {
        next(err); return;
      }
      gravatar.name = 'gravatar';
      next(null, gravatar);
    });
  }

  function send (err, data) {
    if (err) {
      winston.info('An error occurred when preparing comment email notifications', err);
      return;
    }
    var permalinkToArticle =  '/articles/' + data.article.slug;
    var email = {
      subject: util.format('Fresh comments on "%s"!', data.article.title),
      intro: 'Someone posted a comment on a thread you\'re watching!',
      comment: {
        author: comment.author,
        content: data.html,
        site: comment.site,
        permalink: permalinkToArticle + '#comment-' + comment._id
      },
      article: {
        title: data.article.title,
        permalink: permalinkToArticle
      },
      images: [data.gravatar]
    };
    subscriberService.send(data.recipients, 'comment-published', email);
  }

  function created (err) {
    if (err) {
      done(null, 400, ['An error occurred while posting your comment!']); return;
    }
    done(null, 200, ['Your comment was successfully published!'], commentService.toJSON(comment));
  }
};
