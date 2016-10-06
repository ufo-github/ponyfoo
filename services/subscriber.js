'use strict';

const _ = require(`lodash`);
const assign = require(`assignment`);
const util = require(`util`);
const contra = require(`contra`);
const winston = require(`winston`);
const emailService = require(`./email`);
const cryptoService = require(`./crypto`);
const Subscriber = require(`../models/Subscriber`);
const env = require(`../lib/env`);
const authority = env(`AUTHORITY`);
const reasons = {
  default: `Thanks for your interest in becoming a subscriber of our mailing list!`,
  comment: `Thank you for sharing your thoughts on my blog, I really appreciate that you took the time to do that. Here’s hoping that you become an active contributor on Pony Foo! I would also like to extend you an invitation to our mailing list!`
};
const allTopics = [`announcements`, `articles`, `newsletter`];

function noop () {}

function getHash (subscriber) {
  return subscriber._id.toString() + cryptoService.md5(subscriber.email);
}

function add (model, done) {
  addTopics(model, undefined, done);
}

function addTopics (model, topics, done = noop) {
  const valid = validateTopics(topics || allTopics.slice());
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
        const wants = _.difference(valid, existing.topics);
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
          winston.info(`Email subscription for "%s" %s via %s`, model.email, getStatus(), model.source || `(unset)`);
        }
        next(err, success, existed);
        function getStatus () {
          if (existed) {
            return `was duplicate`;
          }
          if (success) {
            if (model.verified) {
              return `confirmed`;
            }
            return `requested`;
          }
          return `failed`;
        }
      }
    }
  ], done);
}

function invitationConfirmation (subscriber, topics, done) {
  const hash = getHash(subscriber);
  const some = Array.isArray(topics) && topics.length && topics.length < allTopics.length;
  const query = some ? `?topic=` + topics.join(`&topic=`) : ``;
  const confirm = util.format(`/api/subscribers/%s/confirm%s`, hash, query);
  const model = {
    to: subscriber.email,
    subject: `Pony Foo Subscription Invitation!`,
    teaser: `Would you like to subscribe to Pony Foo?`,
    confirm: confirm,
    topics: topics,
    provider: {
      merge: locals()({}, subscriber)
    },
    linkedData: {
      '@context': `http://schema.org`,
      '@type': `EmailMessage`,
      potentialAction: {
        '@type': `ConfirmAction`,
        name: `Confirm Subscription`,
        handler: {
          '@type': `HttpActionHandler`,
          url: authority + confirm
        }
      },
      description: `Confirm Subscription – Pony Foo`
    }
  };
  emailService.send(`list-subscription`, model, done);
}

function confirm (email, done) {
  Subscriber.update({
    email: email
  }, {
    verified: true,
    topics: allTopics.slice()
  }, successback({
    action: `confirmed`,
    email: email
  }, done));
}

function remove (email, done) {
  Subscriber.remove({ email: email }, successback({
    action: `withdrawn`,
    email: email,
  }, done));
}

function validateTopics (topics) {
  topics.push(`announcements`);
  return _.intersection(allTopics, topics);
}

function confirmTopics (email, topics, done) {
  const valid = validateTopics(topics);
  Subscriber.findOne({ email: email }, found);
  function found (err, subscriber) {
    if (err) {
      bail(topics)(err); return;
    }
    if (!subscriber) {
      bail(topics)(); return;
    }
    const wants = _.difference(valid, subscriber.topics);
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
        action: `confirmed`,
        email: email,
        topic: topics.join(`,`) || `unchanged`
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
    const index = subscriber.topics.indexOf(topic);
    if (index === -1) {
      bail(); return;
    }
    const topics = subscriber.topics.slice();
    topics.splice(index, 1);
    if (topics.length === 0 || (topics.length === 1 && topics[0] === `announcements`)) {
      remove(email, done);
    } else {
      subscriber.topics = topics;
      subscriber.save(bail);
    }
    function bail (err) {
      successback({
        action: `withdrawn`,
        email: email,
        topic: topic,
        hash: getHash(subscriber)
      }, done)(err);
    }
  }
}

function successback (options, done) {
  const action = options.action;
  const email = options.email;
  const topic = options.topic;
  const hash = options.hash;
  return function proceed (err) {
    if (!err) {
      winston.info(`Email subscription for "%s" %s [%s]`, email, action, topic || `*`);
    }
    done(err, !err, topic, hash);
  };
}

function send (options, done) {
  const topic = options.topic;
  const recipients = options.recipients;
  const template = options.template;
  const patrons = options.patrons;
  const partialModel = options.model;
  const emitter = contra.emitter({});

  contra.waterfall([findVerifiedSubscribers, patchModel], done);

  return emitter;

  function findVerifiedSubscribers (next) {
    const query = { verified: true };
    if (topic) {
      query.topics = topic;
    }
    if (patrons === `no`) {
      query.patron = false;
    } else if (patrons === `only`) {
      query.patron = true;
    }
    Subscriber.find(query, next);
  }
  function patchModel (documents, next) {
    const subscribers = recipients ? documents.filter(isRecipient) : documents;
    const to = _.map(subscribers, `email`);
    const provider = {
      merge: subscribers.reduce(locals(topic, emitter), {})
    };
    const model = assign({}, partialModel, { to: to, provider: provider });
    emailService.send(template, model, next);
  }
  function isRecipient (subscriber) {
    return recipients.indexOf(subscriber.email) !== -1;
  }
}

function locals (topic, emitter) {
  return function localsForTopic (all, subscriber) {
    const subscriberLocals = {
      name: subscriber.name ? subscriber.name.split(` `)[0] : `there`,
      reason: reasons[subscriber.source] || reasons.default,
      unsubscribe_html: getUnsubscribeHtml(subscriber, topic)
    };
    all[subscriber.email] = subscriberLocals;
    if (emitter) {
      emitter.emit(`locals`, subscriber.email, subscriberLocals);
    }
    return all;
  };
}

function getUnsubscribeHtml (subscriber, topic) {
  const urlformat = `%s/api/subscribers/%s/unsubscribe%s`;
  const linkformat = `<a href="%s" style="color:#e92c6c;text-decoration:none;">unsubscribe</a>`;
  const href = util.format(urlformat, authority, getHash(subscriber), getHrefTopic());
  return util.format(linkformat, href);
  function getHrefTopic () {
    return topic ? `?topic=` + topic : ``;
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
