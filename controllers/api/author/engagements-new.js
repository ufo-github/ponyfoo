'use strict'

const winston = require(`winston`)
const moment = require(`moment`)
const Engagement = require(`../../../models/Engagement`)

module.exports = function (req, res) {
  const body = req.body
  const model = {
    start: moment.utc(body.start, `DD-MM-YYYY`).toDate(),
    end: moment.utc(body.end, `DD-MM-YYYY`).toDate(),
    conference: body.conference,
    website: toUrl(body.website),
    venue: body.venue,
    location: body.location,
    tags: body.tags.toLowerCase().split(` `)
  }
  new Engagement(model).save(saved)
  function toUrl (href) {
    return /https?:\/\//i.test(href) ? href : `http://` + href
  }
  function saved (err) {
    if (err) {
      winston.error(err)
      res.redirect(`/speaking/new`)
    } else {
      res.redirect(`/speaking/review`)
    }
  }
}
