'use strict';

require('./lib/logging').configure();

var _ = require('lodash');
var contra = require('contra');
var mongoose = require('mongoose');
var winston = require('winston');
var db = require('./lib/db');
var models = require('./models');
var Article = require('./models/Article');
var Subscriber = require('./models/Subscriber');
var User = require('./models/User');
var UnverifiedUser = require('./models/UnverifiedUser');
var UserVerificationToken = require('./models/UserVerificationToken');
var PasswordResetToken = require('./models/PasswordResetToken');
var cryptoService = require('./services/crypto');
var articleSearch = require('./services/articleSearch');
var markdownFatService = require('./services/markdownFat');
var env = require('./lib/env');
var prd = env('MIGRATION_SOURCE_URI');
var ObjectId = mongoose.Schema.Types.ObjectId;
var socket = { socketOptions: { connectTimeoutMS: 2000, keepAlive: 1 } };
var options = { server: socket, replset: socket, db: { native_parser: true } };
var production;
var previous;

env('BULK_INSERT', true);

db(operational);

function operational () {
  winston.info('connected to local!');
  models();

  contra.concurrent([
    function (next) { Article.remove({}, next); },
    function (next) { Subscriber.remove({}, next); },
    function (next) { User.remove({}, next); },
    function (next) { UnverifiedUser.remove({}, next); },
    function (next) { UserVerificationToken.remove({}, next); },
    function (next) { PasswordResetToken.remove({}, next); }
  ], prod);

  function prod () {
    production = mongoose.createConnection(prd, options);
    production.once('connected', connected);
    production.on('error', error);
  }
}

function connected () {
  winston.info('connected to production!');
  require('./migration/models-old/fill')(production);
  ready();
}

function error (err) {
  winston.error(err);
}

function ready () {
  var model = {
    email: 'nicolasbevacqua@gmail.com',
    displayName: 'Nicolas Bevacqua',
    bypassEncryption: false,
    author: true,
    password: env('MIGRATION_AUTHOR_PASSWORD')
  };

  new User(model).save(function (err, author) {
    articles(author, function (articles) {
      contra.map.series(articles, insertArticle, function (err, articles) {
        winston.info('Rebuilding index for fun and profit!');
        articleSearch.refreshRelated(function () {
          users(function (users) {
            subscribe(users, function (err, subscribers) {
              comments(users, function (discussions) {
                contra.each.series(discussions, insertCommentThread, done);

                function insertCommentThread (discussion, next) {
                  var children = discussion.comments;
                  var op = children.shift();

                  production.model('entry').findOne({ _id: discussion.entry }, function (err, entry) {
                    Article.findOne({ slug: entry.slug }, function (err, article) {
                      var comment = article.comments.create(op);
                      article.comments.push(comment);
                      article.save(function () {
                        children.forEach(function (child) {
                          child.parent = op._id;
                          article.comments.push(child);
                        });
                        article.save(function () {
                          next();
                        });
                      });
                    });
                  });
                }
              });
            });
          });
        });
      });
    });
  });
}

function done () {
  winston.info('Migration complete.');
  process.exit();
}

function subscribe (users, done) {
  production.model('blogSubscriber').find({}, function (err, documents) {
    var subscribers = _(documents).concat(users).pluck('email').compact().uniq().value().map(expand);

    function expand (email) {
      var s = _.find(subscribers, { email: email });
      var u = _.find(users, { email: email });
      return {
        verified: true,
        source: 'migration',
        email: email,
        name: u ? u.displayName : undefined,
        created: (s||u).created
      };
    }

    contra.map(subscribers, insertSubscriber, done);

    function insertSubscriber (model, done) {
      new Subscriber(model).save(function (err, subscriber) {
        done(null, subscriber);
      });
    }
  });
}

function insertArticle (article, next) {
  if (previous) {
    article.prev = previous._id;
  }
  new Article(article).save(function (err, article) {
    if (previous) {
      previous.next = article._id;
      previous.save(function (err) {
        next(null, article);
      });
    } else {
      previous = article;
      next(null, article);
    }
  });
}

function articles (author, done) {
  production.model('entry').find({}).sort('date').exec(function (err, entries) {
    var articles = entries.map(toArticle);

    function toArticle (entry) {
      return {
        created: entry.date,
        updated: entry.updated,
        publication: entry.date,
        status: 'published',
        introduction: entry.brief,
        body: entry.text,
        author: author._id,
        slug: entry.slug,
        title: entry.title,
        tags: entry.tags
      };
    }

    done(articles);
  });

}

function users (done) {
  production.model('user').find({}).exec(function (err, users) {
    done(users);
  });
}

function comments (users, done) {
  production.model('discussion').find({}).populate('comments').sort('date').exec(function (err, discussions) {
    var articleComments = discussions.map(toThreads);

    function toThreads (discussion) {
      return {
        entry: discussion.entry,
        comments: discussion.comments.map(toComment)
      };
    }

    function toComment (comment) {
      var u = user(comment.author.gravatar);

      return {
        created: comment.date,
        content: comment.text,
        contentHtml: markdownFatService.compileExternalizeLinks(comment.text),
        author: u.displayName,
        email: u.email,
        site: u.website ? u.website.url : null
      };
    }

    done(articleComments);
  });


  function user (gravatar) {
    var hash = gravatar.replace('http://www.gravatar.com/avatar/', '').replace('?d=identicon&r=PG', '');
    return _.find(users, function (user) {
      return cryptoService.md5(user.email) === hash;
    });
  }
}
