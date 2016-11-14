'use strict'

const pullData = require(`../lib/pullData`)
const subscriberService = require(`../../services/subscriber`)

module.exports = function (req, res, next) {
  pullData(function render (err, result) {
    if (err) {
      next(err); return
    }

    res.viewModel = {
      model: {
        title: `Subscribe to Pony Foo!`,
        subscriberGraph: result,
        topics: subscriberService.getTopics(),
        meta: {
          canonical: `/subscribe`
        }
      }
    }
    next()
  })
}
