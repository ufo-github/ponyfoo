'use strict';

var _ = require('lodash');
var util = require('util');
var assign = require('assignment');
var insane = require('insane');
var contra = require('contra');
var winston = require('winston');
var Article = require('../../../../models/Article');
var WeeklyIssue = require('../../../../models/WeeklyIssue');
var validate = require('./validate');
var commentService = require('../../../../services/comment');
var markupService = require('../../../../services/markup');
var gravatarService = require('../../../../services/gravatar');
var subscriberService = require('../../../../services/subscriber');
var env = require('../../../../lib/env');
var authority = env('AUTHORITY');
var words = env('SPAM_WORDS');
var delimiters = '[?@,;:.<>{}()\\[\\]\\s_-]';
var rdelimited = new RegExp(util.format('(^|%s)(%s)(%s|$)', delimiters, words, delimiters), 'i');
var ranywhere = new RegExp(words, 'i');
var hostTypes = {
  articles: {
    name: 'Article',
    schema: Article,
    query: { status: 'published' },
    topic: 'articles'
  },
  weeklies: {
    name: 'Weekly issue',
    schema: WeeklyIssue,
    query: { status: 'released' },
    topic: 'newsletter'
  }
};

module.exports = function (options, done) {
  var hostType = hostTypes[options.type];
  var validation = validate(options.model);
  if (validation.length) {
    done(null, 400, validation); return;
  }
  var model = validation.model;
  var comment;

  contra.waterfall([findHost, decisionTree, create], created);

  function findHost (next) {
    hostType.schema
      .findOne(assign({ slug: options.slug }, hostType.query))
      .populate('comments')
      .exec(next);
  }

  function decisionTree (host, next) {
    if (!host) {
      done(null, 404, [hostType.name + ' not found']); return;
    }
    next(null, host);
  }

  function create (host, next) {
    var parent;
    var parentId = model.parent;
    if (parentId) {
      parent = host.comments.id(parentId);
      if (!parent) {
        done(null, 404, ['The comment thread has been deleted!']); return;
      }
      if (parent.parent) {
        done(null, 400, ['Comments can’t be nested that deep!']); return;
      }
    }
    if (spam(model)) {
      next(null); return;
    }
    var opts = {
      deferImages: true,
      externalize: true
    };
    var md = model.content.replace(/http:\/\/i\.imgur\.com\//g, 'https://i.imgur.com/');
    var html = markupService.compile(model.content, opts);
    var runsafe = /^\s*http:\/\//i;
    var unsafeImages = false;
    insane(html, {
      filter: function filter (token) {
        if (token.tag === 'img' && (runsafe.test(token.attrs.src) || runsafe.test(token.attrs['data-src']))) {
          unsafeImages = true;
        }
        return !unsafeImages;
      }
    });
    if (unsafeImages) {
      done(null, 400, ['Please ensure your images are loaded securely over HTTPS.']); return;
    }
    model.content = md;
    model.contentHtml = html;
    comment = host.comments.create(model);
    host.comments.push(comment);
    host.save(saved);

    function saved (err) {
      if (!err) {
        subscriberService.add({
          email: comment.email,
          name: comment.author,
          source: 'comment'
        });
        notify(host);
      }
      next(err);
    }
  }

  function notify (host) {
    contra.concurrent({
      recipients: contra.curry(findRecipients, host),
      html: absolutizeHtml,
      gravatar: fetchGravatar
    }, function prepare (err, data) {
      if (err) {
        send(err); return;
      }
      data.host = host;
      send(null, data);
    });
  }

  function findRecipients (host, next) {
    contra.waterfall([hydrate, calculate], next);

    function hydrate (next) {
      host.populate('author', next);
    }

    function calculate (host, next) {
      var emails = [host.author.email];
      var thread, op;
      var parentId = comment.parent;
      if (parentId) {
        op = host.comments.id(parentId);
        thread = host.comments.filter(sameThread);
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
    next(null, markupService.compile(comment.contentHtml, { markdown: false, absolutize: true }));
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
    var permalinkToHost =  util.format('/%s/%s', options.type, data.host.slug);
    var permalinkToComment = util.format('%s#comment-%s', permalinkToHost, comment._id);
    var email = {
      subject: util.format('Fresh comments on "%s"!', data.host.title),
      teaser: 'Someone posted a comment on a thread you’re watching!',
      comment: {
        author: comment.author,
        content: data.html,
        site: comment.site,
        permalink: permalinkToComment
      },
      host: {
        titleHtml: data.host.titleHtml || data.host.title,
        permalink: permalinkToHost
      },
      images: [data.gravatar],
      linkedData: {
        '@context': 'http://schema.org',
        '@type': 'EmailMessage',
        potentialAction: {
          '@type': 'ViewAction',
          name: 'Reply',
          target:  authority + permalinkToComment
        },
        description: 'Reply to Comment – ' + data.host.title
      }
    };
    subscriberService.send({
      topic: hostType.topic,
      template: 'comment-published',
      recipients: data.recipients,
      model: email
    });
  }

  function created (err) {
    if (err) {
      done(null, 400, ['An error occurred while posting your comment!']); return;
    }
    done(null, 200, ['Your comment was successfully published!'], comment ? commentService.toJSON(comment) : model);
  }
};

function spam (comment) {
  var caught = (
    spamIn(comment.content) ||
    spamIn(comment.site, ranywhere) ||
    spamIn(comment.author)
  );
  return caught;
  function spamIn (field, target) {
    return (field || '').match(target || rdelimited);
  }
}
