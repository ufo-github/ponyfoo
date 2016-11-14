'use strict'

const moment = require(`moment`)
const google = require(`googleapis`)
const env = require(`../../lib/env`)
const email = env(`GA_EMAIL`)
const privateKey = env(`GA_PRIVATE_KEY`)
const profile = env(`GA_PROFILE`)
const dev = env(`NODE_ENV`) === `development`
const analyticsScope = `https://www.googleapis.com/auth/analytics.readonly`

function pullPageViews (done) {
  if (!email || !privateKey || !profile) {
    done(null, []); return
  }
  const jwt = new google.auth.JWT(
    email,
    null,
    privateKey,
    [analyticsScope],
    null
  )
  jwt.authorize(authorized)
  function authorized (err) {
    if (err) {
      done(dev ? null : err, []); return
    }
    const query = {
      auth: jwt,
      ids: `ga:` + profile,
      'start-date': `2012-12-25`,
      'end-date': `today`,
      'max-results': 10000,
      metrics: `ga:pageviews`,
      dimensions: `ga:date`,
      sort: `ga:date`
    }
    google.analytics(`v3`).data.ga.get(query, got)
  }
  function got (err, result) {
    if (err) {
      done(dev ? null : err, []); return
    }
    done(null, result.rows.map(toDailyPageView))
  }
}

function toDailyPageView (item) {
  return {
    date: moment.utc(item[0], `YYYYMMDD`).toDate(),
    views: parseInt(item[1])
  }
}

module.exports = pullPageViews
