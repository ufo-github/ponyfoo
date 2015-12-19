'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var winston = require('winston');
var emailService = require('./email');
var cryptoService = require('./crypto');
var Subscriber = require('../models/Subscriber');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var intent = 'Thanks for your interest in becoming a subscriber of our mailing list!';
var reasons = {
  landed: intent,
  article: intent,
  sidebar: intent,
  comment: 'Thank you for sharing your thoughts on my blog, I really appreciate that you took the time to do that. Here\'s hoping that you become an active contributor on Pony Foo! I would also like to extend you an invitation to our mailing list!'
};

function noop () {}

function getHash (subscriber) {
  return subscriber._id.toString() + cryptoService.md5(subscriber.email);
}

function add (data, done) {
  contra.waterfall([
    function findExisting (next) {
      Subscriber.findOne({ email: data.email }, next);
    },
    function bailOrCreate (existing, next) {
      if (existing) {
        ack(null, false, true); return;
      }
      new Subscriber(data).save(saved);

      function saved (err, subscriber) {
        if (err) {
          ack(err, false);
        } else if (data.verified !== true) {
          confirmation(subscriber, confirmationSent);
        } else {
          ack(null, true); return;
        }
      }
      function confirmationSent () {
        ack(null, true);
      }
      function ack (err, success, existed) {
        if (err) {
          winston.warn(err);
        } else {
          winston.info('Email subscription for "%s" %s via %s', data.email, getStatus(), data.source || '(unset)');
        }
        next(err, success, existed);
        function getStatus () {
          if (existed) {
            return 'was duplicate';
          }
          if (success) {
            if (data.verified) {
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

function confirmation (subscriber, done) {
  var hash = getHash(subscriber);
  var model = {
    to: subscriber.email,
    subject: 'Pony Foo Subscription Invitation!',
    teaser: 'Would you like to subscribe to Pony Foo?',
    confirm: util.format('/api/subscribers/%s/confirm', hash),
    mandrill: {
      merge: {
        locals: [locals(subscriber)]
      }
    }
  };
  emailService.send('list-subscription', model, done);
}

function confirm (email, done) {
  Subscriber.update({ email: email }, { verified: true }, successback('confirmed', email, done));
}

function remove (email, done) {
  Subscriber.remove({ email: email }, successback('withdrawn', email, done));
}

function successback (action, email, done) {
  return function proceed (err) {
    if (!err) {
      winston.info('Email subscription for "%s" %s', email, action);
    }
    done(err, !err);
  };
}

function send (recipients, template, partialModel, done) {
  contra.waterfall([
    function findVerifiedSubscribers (next) {
      Subscriber.find({ verified: true }, next);
    },
    function patchModel (documents, next) {
      var subscribers = recipients ? documents.filter(isRecipient) : documents;
      var to = _.pluck(subscribers, 'email');
      var mandrill = {
        merge: {
          locals: subscribers.map(locals)
        }
      };
      var model = _.merge({}, partialModel, { to: to, mandrill: mandrill });
      emailService.send(template, model, next);
    }
  ], done);

  function isRecipient (subscriber) {
    return recipients.indexOf(subscriber.email) !== -1;
  }
}

function broadcast (template, model, done) {
  send(null, template, model, done);
}

function locals (subscriber) {
  return {
    email: subscriber.email,
    model: {
      name: subscriber.name ? subscriber.name.split(' ')[0] : 'there',
      reason: reasons[subscriber.source],
      unsubscribe_html: getUnsubscribeHtml(subscriber)
    }
  };
}

function getUnsubscribeHtml (subscriber) {
  var href = util.format('%s/api/subscribers/%s/unsubscribe', authority, getHash(subscriber));
  return util.format('<a href="%s">unsubscribe</a>', href);
}

module.exports = {
  add: add,
  remove: remove,
  confirm: confirm,
  send: send,
  broadcast: broadcast
};
