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
  const bucket = {
    date: week.toDate(),
    dateText: week.format(`Do MMMM ’YY`),
    migration: 0,
    unverified: 0,
    twitter: 0,
    bubble: 0,
    weekly: 0,
    sidebar: 0,
    comment: 0,
    article: 0,
    landed: 0
  };
  addToBucket(bucket, seedSubscriber);
  return bucket;
}

function addToBucket (bucket, subscriber) {
  bucket[findSource(subscriber)]++;
}

function findSource (subscriber) {
  if (!subscriber.verified) {
    return `unverified`;
  }
  if (subscriber.source === `intent`) {
    return `sidebar`;
  }
  return subscriber.source.split(`+`)[0];
}

function isVerified (subscriber) {
  return subscriber.verified;
}
