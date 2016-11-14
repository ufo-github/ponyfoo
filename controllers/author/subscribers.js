'use strict'

const contra = require(`contra`)
const pullData = require(`../lib/pullData`)
const Subscriber = require(`../../models/Subscriber`)
const subscriberService = require(`../../services/subscriber`)
const datetimeService = require(`../../services/datetime`)
const userService = require(`../../services/user`)

module.exports = function (req, res, next) {
  const max = 100
  const page = parseInt(req.params.page, 10) || 1
  const p = page - 1
  const start = max * p

  contra.concurrent({
    subscriberGraph: pullData,
    subscribers: pullSubscribers
  }, ready)

  function pullSubscribers (next) {
    Subscriber
      .find({})
      .sort(`-created`)
      .skip(start)
      .limit(max)
      .lean()
      .exec(found)
    function found (err, subscribers) {
      if (err) {
        next(err); return
      }
      next(null, subscribers.map(toModel))
    }
  }

  function toModel (subscriber) {
    return {
      created: datetimeService.field(subscriber.created),
      email: subscriber.email,
      avatar: userService.getAvatar(subscriber),
      topics: subscriber.topics,
      source: subscriber.source.split(`+`)[0],
      verified: subscriber.verified,
      hash: subscriberService.getHash(subscriber)
    }
  }

  function ready (err, result) {
    if (err) {
      next(err); return
    }

    res.viewModel = {
      model: {
        title: `Subscribers \u2014 Pony Foo`,
        subscriberGraph: result.subscriberGraph,
        subscribers: result.subscribers,
        allTopics: subscriberService.getTopics(),
        more: result.subscribers.length >= max,
        page: page
      }
    }
    next()
  }
}
