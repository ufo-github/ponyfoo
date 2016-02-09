'use strict';

var moment = require('moment');
var Subscriber = require('../../models/Subscriber');

module.exports = pullSubscribers;

function pullSubscribers (done) {
  Subscriber
    .find({})
    .sort('created')
    .select('-_id source created verified')
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
  var copy = subscribers.slice();
  var list = [];
  var subscriber;
  var week;
  var current;
  while (copy.length) {
    subscriber = copy.pop();
    week = moment(subscriber.created).subtract(7, 'days');
    current = {
      date: week.toDate(),
      dateText: week.format('Do MMMM ’YY'),
      migration: 0,
      unverified: 0,
      twitter: 0,
      sidebar: 0,
      comment: 0,
      article: 0,
      landed: 0
    };
    add();
    while (copy.length) {
      subscriber = copy.pop();
      if (moment(subscriber.created).isAfter(week)) {
        add();
      } else {
        break;
      }
    }
    list.push(current);
  }
  var verified = subscribers.filter(isVerified).length;
  return {
    list: list,
    verified: verified
  };
  function add () {
    current[source()]++;
  }
  function source () {
    if (subscriber.verified) {
      return subscriber.source === 'intent' ? 'sidebar' : subscriber.source;
    }
    return 'unverified';
  }
  function isVerified (s) {
    return s.verified;
  }
}
