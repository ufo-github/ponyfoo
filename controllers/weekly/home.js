'use strict'

const env = require(`../../lib/env`)
const staticService = require(`../../services/static`)
const authority = env(`AUTHORITY`)
const WeeklyIssue = require(`../../models/WeeklyIssue`)

module.exports = function (req, res, next) {
  const query = { status: `released`, statusReach: `everyone` }
  WeeklyIssue.count(query, counted)
  function counted (err, count) {
    if (err) {
      next(err); return
    }
    res.viewModel = {
      model: {
        title: `Pony Foo Weekly`,
        meta: {
          canonical: `/weekly`,
          images: [authority + staticService.unroll(`/img/ponyfooweekly-sample.png`)],
          description: `Pony Foo Weekly is a newsletter discussing interesting and trending topics around the web platform. It comes out once a week, on thursdays.`
        },
        any: count > 0
      }
    }
    next()
  }
}
