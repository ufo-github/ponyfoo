'use strict'

const subscriberService = require(`../../services/subscriber`)

module.exports = function (req, res, next) {
  const allTopics = subscriberService.getTopics()
  let queryTopics = req.query.topic
  if (typeof queryTopics === `string`) { queryTopics = [queryTopics] }
  if (!Array.isArray(queryTopics)) { queryTopics = allTopics.slice() }
  queryTopics.push(`announcements`)

  res.viewModel = {
    model: {
      title: `Subscribed to Pony Foo!`,
      topics: allTopics.slice().filter(byQuery),
      meta: {
        canonical: `/subscribed`
      }
    }
  }
  next()

  function byQuery (topic) {
    if (queryTopics) {
      if (Array.isArray(queryTopics)) {
        return queryTopics.indexOf(topic) !== -1
      }
      return queryTopics === topic || queryTopics
    }
    return true
  }
}
