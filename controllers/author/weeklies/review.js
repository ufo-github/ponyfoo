'use strict'

const _ = require(`lodash`)
const contra = require(`contra`)
const WeeklyIssue = require(`../../../models/WeeklyIssue`)
const weeklyService = require(`../../../services/weekly`)
const settingService = require(`../../../services/setting`)

module.exports = getModel

function getModel (req, res, next) {
  contra.concurrent({
    live: function (next) {
      settingService.getKey(`PONYFOOWEEKLY_CRON`, next)
    },
    level: function (next) {
      settingService.getKey(`PONYFOOWEEKLY_CRON_LEVEL`, next)
    },
    weeklies: function (next) {
      WeeklyIssue
        .find({})
        .sort([[`publication`, -1], [`created`, -1]])
        .populate(`author`, `slug email avatar`)
        .exec(next)
    }
  }, respond)

  function respond (err, result) {
    if (err) {
      next(err); return
    }
    const sorted = _.sortBy(result.weeklies, sortByStatus)
    const models = sorted.map(weeklyService.toMetadata)
    res.viewModel = {
      model: {
        title: `Newsletter Review`,
        meta: {
          canonical: `/weekly/review`
        },
        weeklies: models,
        live: result.live,
        level: result.level
      }
    }
    next()
  }
}

function sortByStatus (doc) {
  const state = { draft: 0, ready: 1, released: 2 }[doc.status]
  const reach = { undefined: 0, scheduled: 1, patrons: 2, everyone: 3 }[doc.statusReach]
  return state + reach
}
