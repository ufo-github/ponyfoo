'use strict';

const _ = require('lodash');
const util = require('util');
const assign = require('assignment');
const insane = require('insane');
const contra = require('contra');
const winston = require('winston');
const User = require('../../../../models/User');
const Article = require('../../../../models/Article');
const WeeklyIssue = require('../../../../models/WeeklyIssue');
const validate = require('./validate');
const commentService = require('../../../../services/comment');
const markupService = require('../../../../services/markup');
const gravatarService = require('../../../../services/gravatar');
const subscriberService = require('../../../../services/subscriber');
const env = require('../../../../lib/env');
const authority = env('AUTHORITY');
const ownerEmail = env('OWNER_EMAIL');
const words = env('SPAM_WORDS');
const delimiters = '[?@,;:.<>{}()\\[\\]\\s_-]';
const rdelimited = new RegExp(util.format('(^|%s)(%s)(%s|$)', delimiters, words, delimiters), 'i');
const ranywhere = new RegExp(words, 'i');
const hostTypes = {
  articles: {
    name: 'Article',
    schema: Article,
    query: {},
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
  const hostType = hostTypes[options.type];
  const validation = validate(options.model);
  if (validation.length) {
    done(null, 400, validation); return;
  }
  const model = validation.model;
  let comment;

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
    let parent;
    const parentId = model.parent;
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
    if (options.type === 'articles' && host.status !== 'published' && !options.user) {
      done(null, 400, ['You can’t comment on article drafts!']); return;
    }
    const opts = {
      deferImages: true,
      externalize: true
    };
    const rimgur = /http:\/\/i\.imgur\.com\//g;
    const secureImgur = 'https://i.imgur.com/';
    const md = model.content.replace(rimgur, secureImgur);
    const html = markupService.compile(model.content, opts);
    const runsafe = /^\s*http:\/\//i;
    let unsafeImages = false;
    insane(html, {
      filter (token) {
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
      gravatar: fetchGravatar,
      host: getHost,
      moderators: getModerators
    }, prepare);
    function getHost (next) {
      next(null, host);
    }
    function getModerators (next) {
      const moderatorRoles = ['owner', 'editor', 'moderator'];
      const query = { roles: { $in: moderatorRoles } };
      User.find(query).lean().select('email').exec(found);
      function found (err, users) {
        if (err) {
          next(err); return;
        }
        next(null, _.map(users, 'email'));
      }
    }
    function prepare (err, result) {
      if (err) {
        winston.info('An error occurred when preparing comment email notifications', err);
        return;
      }
      sendEmailNotifications(result);
    }
  }

  function findRecipients (host, next) {
    contra.waterfall([hydrate, calculate], next);

    function hydrate (next) {
      host.populate('author', next);
    }

    function calculate (host, next) {
      let emails = [ownerEmail, host.author.email];
      let thread, op;
      const parentId = comment.parent;
      if (parentId) {
        op = host.comments.id(parentId);
        thread = host.comments.filter(sameThread);
        thread.unshift(op);
        emails = emails.concat(_.map(thread, 'email'));
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

  function sendEmailNotifications (data) {
    const permalinkToHost =  util.format('/%s/%s', options.type, data.host.slug);
    const permalinkToComment = util.format('%s#comment-%s', permalinkToHost, comment._id);
    const email = {
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

    const emitter = subscriberService.send({
      topic: hostType.topic,
      template: 'comment-published',
      recipients: data.recipients,
      model: email
    });
    emitter.on('locals', applyLocals);

    function applyLocals (email, locals) {
      const isModerator = data.moderators.indexOf(email) !== -1;
      locals.comment_removal_link_html = isModerator ? canRemove() : '';
      function canRemove () {
        const template = 'Or, <a href="%s" style="color: #1686a2;">delete</a>.';
        const remove = util.format('%s/api%s/comments/%s/remove', authority, permalinkToHost, comment._id);
        const html = util.format(template, remove);
        return html;
      }
    }
  }

  function created (err) {
    if (err) {
      done(null, 400, ['An error occurred while posting your comment!']); return;
    }
    done(null, 200, ['Your comment was successfully published!'], comment ? commentService.toJSON(comment) : model);
  }
};

function spam (comment) {
  const caught = (
    spamIn(comment.content) ||
    spamIn(comment.site, ranywhere) ||
    spamIn(comment.author)
  );
  return caught;
  function spamIn (field, target) {
    return (field || '').match(target || rdelimited);
  }
}
