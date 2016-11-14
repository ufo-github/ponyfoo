'use strict'

const contra = require(`contra`)
const subscriberService = require(`../../../services/subscriber`)
const weeklySubscriberService = require(`../../../services/weeklySubscriber`)
const unfold = require(`./lib/unfold`)

function remove (req, res, next) {
  let topics = req.query.topic
  if (typeof topics === `string`) {
    topics = [topics]
  }

  contra.waterfall([
    contra.curry(unfold, req, res),
    confirm
  ], respond)

  function confirm (subscriber, next) {
    if (!subscriber) {
      next(null, false); return
    }
    const allTopics = !Array.isArray(topics)
    const proceed = shouldPeekAtNewsletter() ? peekAtNewsletter : noPeeking
    if (allTopics) {
      subscriberService.confirm(subscriber.email, proceed)
    } else {
      subscriberService.confirmTopics(subscriber.email, topics, proceed)
    }

    function shouldPeekAtNewsletter () {
      const wasUnverified = !subscriber.verified
      const isNewsletter = allTopics || topics.indexOf(`newsletter`) !== -1
      return wasUnverified && isNewsletter
    }

    function peekAtNewsletter (err, success) {
      if (err) {
        next(err); return
      }
      if (!success) {
        next(null, success); return
      }
      weeklySubscriberService.emailPreview(subscriber.email)
      next(err, success, true)
    }

    function noPeeking (err, success) {
      next(err, success, false)
    }
  }

  function respond (err, success, peeked) {
    if (err) {
      next(err); return
    }
    if (success) {
      req.flash(`success`, `Your subscription to our mailing list is confirmed!`)
      if (peeked) {
        req.flash(`success`, `You’ll be getting our latest newsletter via email soon, enjoy!`)
      }
    } else {
      req.flash(`error`, `Your confirmation request was invalid and couldn’t be fulfilled!`)
    }
    if (req.query.returnTo) {
      res.redirect(req.query.returnTo)
    } else if (Array.isArray(topics)) {
      res.redirect(`/subscribed` + topics.reduce(toKeyValue, ``))
    } else {
      res.redirect(`/subscribed`)
    }
  }
  function toKeyValue (query, topic, i) {
    const connector = i === 0 ? `?` : `&`
    return query + connector + topic
  }
}

module.exports = remove
