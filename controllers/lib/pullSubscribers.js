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
  const verified = subscribers.filter(isVerified).length;
  const copy = subscribers.slice();
  const buckets = getBuckets(copy);
  return { verified, buckets };
}

function getBuckets (all) {
  const buckets = [];
  let bucket;
  let subscriber = all.pop();
  let stay = !!subscriber;
  while (stay) {
    stay = false;
    bucket = initBucket(subscriber);
    while (all.length) {
      subscriber = all.pop();
      const wasCreatedLater = moment.utc(subscriber.created).isAfter(bucket.date);
      if (wasCreatedLater) {
        addToBucket(bucket, subscriber);
      } else {
        stay = true;
        break;
      }
    }
    buckets.push(bucket);
  }
  return buckets;
}

function initBucket (seedSubscriber) {
  const week = moment.utc(seedSubscriber.created).subtract(7, `days`);
  const sources = [
    `migration`,
    `twitter`,
    `bubble`,
    `weekly`,
    `sidebar`,
    `comment`,
    `article`,
    `landed`,
    `unverified`,
    `registration`,
    `promo`
  ];
  const bucket = {
    date: week.toDate(),
    dateText: week.format(`Do MMMM ’YY`)
  };
  sources.forEach(source => {
    bucket[source] = { v: 0, u: 0 };
  });
  addToBucket(bucket, seedSubscriber);
  return bucket;
}

function addToBucket (bucket, subscriber) {
  const source = findSource(subscriber);
  const state = subscriber.verified ? `v` : `u`;
  bucket[source][state]++;
  if (state === `u`) {
    bucket.unverified.v++;
  }
}

function findSource (subscriber) {
  if (subscriber.source === `intent`) {
    return `sidebar`;
  }
  return subscriber.source.split(`+`)[0];
}

function isVerified (subscriber) {
  return subscriber.verified;
}
