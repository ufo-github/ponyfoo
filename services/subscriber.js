'use strict';

var _ = require('lodash');
var assign = require('assignment');
var util = require('util');
var contra = require('contra');
var winston = require('winston');
var emailService = require('./email');
var cryptoService = require('./crypto');
var Subscriber = require('../models/Subscriber');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var reasons = {
  default: 'Thanks for your interest in becoming a subscriber of our mailing list!',
  comment: 'Thank you for sharing your thoughts on my blog, I really appreciate that you took the time to do that. Here’s hoping that you become an active contributor on Pony Foo! I would also like to extend you an invitation to our mailing list!'
};
var allTopics = ['announcements', 'articles', 'newsletter'];
var topicDisplayText = {
  articles: 'articles and comments',
  newsletter: 'the newsletter'
};

function noop () {}

function getHash (subscriber) {
  return subscriber._id.toString() + cryptoService.md5(subscriber.email);
}

function add (model, done) {
  addTopics(model, undefined, done);
}

function addTopics (model, topics, done) {
  var valid = validateTopics(topics || allTopics.slice());
  contra.waterfall([
    function findExisting (next) {
      Subscriber.findOne({ email: model.email }, next);
    },
    function bailOrCreate (existing, next) {
      if (existing) {
        existed(); return;
      }
      if (model.verified) {
        model.topics = valid;
      }
      new Subscriber(model).save(saved);

      function existed () {
        var wants = _.difference(valid, existing.topics);
        if (wants.length === 0) {
          ack(null, false, true);
        } else {
          invitationConfirmation(existing, wants, invitationConfirmationSent);
        }
      }
      function saved (err, subscriber) {
        if (err) {
          ack(err, false);
        } else if (model.verified !== true) {
          invitationConfirmation(subscriber, valid, invitationConfirmationSent);
        } else {
          ack(null, true); return;
        }
      }
      function invitationConfirmationSent (err) {
        ack(err, true);
      }
      function ack (err, success, existed) {
        if (err) {
          winston.warn(err);
        } else {
          winston.info('Email subscription for "%s" %s via %s', model.email, getStatus(), model.source || '(unset)');
        }
        next(err, success, existed);
        function getStatus () {
          if (existed) {
            return 'was duplicate';
          }
          if (success) {
            if (model.verified) {
              return 'confirmed';
            } else {
              return 'requested';
            }
          }
          return 'failed';
        }
      }
    }
  ], done || noop);
}

function invitationConfirmation (subscriber, topics, done) {
  var hash = getHash(subscriber);
  var some = Array.isArray(topics) && topics.length && topics.length < allTopics.length;
  var query = some ? '?topic=' + topics.join('&topic=') : '';
  var confirm = util.format('/api/subscribers/%s/confirm%s', hash, query);
  var model = {
    to: subscriber.email,
    subject: 'Pony Foo Subscription Invitation!',
    teaser: 'Would you like to subscribe to Pony Foo?',
    confirm: confirm,
    topics: topics,
    provider: {
      merge: locals()({}, subscriber)
    },
    linkedData: {
      '@context': 'http://schema.org',
      '@type': 'EmailMessage',
      potentialAction: {
        '@type': 'ConfirmAction',
        name: 'Confirm Subscription',
        handler: {
          '@type': 'HttpActionHandler',
          url: authority + confirm
        }
      },
      description: 'Confirm Subscription – Pony Foo'
    }
  };
  emailService.send('list-subscription', model, done);
}

function confirm (email, done) {
  Subscriber.update({
    email: email
  }, {
    verified: true,
    topics: allTopics.slice()
  }, successback({
   action: 'confirmed',
   email: email
  }, done));
}

function remove (email, done) {
  Subscriber.remove({ email: email }, successback({
   action: 'withdrawn',
   email: email,
  }, done));
}

function validateTopics (topics) {
  topics.push('announcements');
  return _.intersection(allTopics, topics);
}

function confirmTopics (email, topics, done) {
  var valid = validateTopics(topics);
  Subscriber.findOne({ email: email }, found);
  function found (err, subscriber) {
    if (err) {
      bail(topics)(err); return;
    }
    if (!subscriber) {
      bail(topics)(); return;
    }
    var wants = _.difference(valid, subscriber.topics);
    wants.forEach(addWant);
    subscriber.verified = true;
    subscriber.save(bail(wants));
    function addWant (want) {
      subscriber.topics.push(want);
    }
  }
  function bail (topics) {
    return function (err) {
      successback({
       action: 'confirmed',
       email: email,
       topic: topics.join(',') || 'unchanged'
      }, done)(err);
    };
  }
}

function removeTopic (email, topic, done) {
  Subscriber.findOne({ email: email }, found);
  function found (err, subscriber) {
    if (err) {
      bail(err); return;
    }
    if (!subscriber) {
      remove(email, done); return;
    }
    var index = subscriber.topics.indexOf(topic);
    if (index === -1) {
      bail(); return;
    }
    var topics = subscriber.topics.slice();
    topics.splice(index, 1);
    if (topics.length === 0 || (topics.length === 1 && topics[0] === 'announcements')) {
      remove(email, done);
    } else {
      subscriber.topics = topics;
      subscriber.save(bail);
    }
    function bail (err) {
      successback({
       action: 'withdrawn',
       email: email,
       topic: topic,
       hash: getHash(subscriber)
      }, done)(err);
    }
  }
}

function successback (options, done) {
  var action = options.action;
  var email = options.email;
  var topic = options.topic;
  var hash = options.hash;
  return function proceed (err) {
    if (!err) {
      winston.info('Email subscription for "%s" %s [%s]', email, action, topic || '*');
    }
    done(err, !err, topic, hash);
  };
}

function send (options, done) {
  var topic = options.topic;
  var recipients = options.recipients;
  var template = options.template;
  var patrons = options.patrons;
  var partialModel = options.model;

  contra.waterfall([findVerifiedSubscribers, patchModel], done);

  function findVerifiedSubscribers (next) {
    var query = { verified: true };
    if (topic) {
      query.topics = topic;
    }
    if (patrons === 'no') {
      query.patron = false;
    } else if (patrons === 'only') {
      query.patron = true;
    }
    Subscriber.find(query, next);
  }
  function patchModel (documents, next) {
    var subscribers = recipients ? documents.filter(isRecipient) : documents;
    var to = _.pluck(subscribers, 'email');
    var provider = {
      merge: subscribers.reduce(locals(topic), {})
    };
    var model = assign({}, partialModel, { to: to, provider: provider });
    emailService.send(template, model, next);
  }
  function isRecipient (subscriber) {
    return recipients.indexOf(subscriber.email) !== -1;
  }
}

function locals (topic) {
  return function localsForTopic (all, subscriber) {
    all[subscriber.email] = {
      name: subscriber.name ? subscriber.name.split(' ')[0] : 'there',
      reason: reasons[subscriber.source] || reasons.default,
      unsubscribe_html: getUnsubscribeHtml(subscriber, topic)
    };
    return all;
  };
}

function getUnsubscribeHtml (subscriber, topic) {
  var urlformat = '%s/api/subscribers/%s/unsubscribe%s';
  var linkformat = '<a href="%s" style="color:#e92c6c;text-decoration:none;">unsubscribe</a>';
  var href = util.format(urlformat, authority, getHash(subscriber), getHrefTopic());
  return util.format(linkformat, href);
  function getHrefTopic () {
    return topic ? '?topic=' + topic : '';
  }
}

function getTopics () {
  return allTopics.slice();
}

module.exports = {
  add: add,
  addTopics: addTopics,
  remove: remove,
  removeTopic: removeTopic,
  confirm: confirm,
  confirmTopics: confirmTopics,
  getHash: getHash,
  getTopics: getTopics,
  send: send
};
