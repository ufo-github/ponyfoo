'use strict';

const moment = require(`moment`);
const Subscriber = require(`../../models/Subscriber`);

module.exports = pullSubscribers;

function pullSubscribers (done) {
  Subscriber
    .find({})
    .sort(`created`)
    .select(`-_id source created verified`)
    .lean()
    .exec(massage);

  function massage (err, subscribers) {
    if (err) {
      done(err); return;
    }
    done(null, toWeeklyDataModel(subscribers));
  }
}

function toWeeklyDataModel (subscribers) {
  const copy = subscribers.slice();
  const list = [];
  let subscriber;
  let week;
  let current;
  while (copy.length) {
    subscriber = copy.pop();
    week = moment.utc(subscriber.created).subtract(7, `days`);
    current = {
      date: week.toDate(),
      dateText: week.format(`Do MMMM ’YY`),
      migration: 0,
      unverified: 0,
      twitter: 0,
      weekly: 0,
      sidebar: 0,
      comment: 0,
      article: 0,
      landed: 0
    };
    add();
    while (copy.length) {
      subscriber = copy.pop();
      if (moment.utc(subscriber.created).isAfter(week)) {
        add();
      } else {
        break;
      }
    }
    list.push(current);
  }
  const verified = subscribers.filter(isVerified).length;
  return {
    list: list,
    verified: verified
  };
  function add () {
    current[source()]++;
  }
  function source () {
    if (!subscriber.verified) {
      return `unverified`;
    }
    if (subscriber.source === `intent`) {
      return `sidebar`;
    }
    return subscriber.source.split(`+`)[0];
  }
  function isVerified (s) {
    return s.verified;
  }
}
