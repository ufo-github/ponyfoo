'use strict'

const fs = require(`fs`)
const contra = require(`contra`)
const winston = require(`winston`)
const moment = require(`moment`)
const Article = require(`../../../models/Article`)
const pkg = require(`../../../package.json`)
const articleSubscriberService = require(`../../../services/articleSubscriber`)
const articlePublishService = require(`../../../services/articlePublish`)
const defaultFormat = `HH:mm:ss -- DD MMMM, YYYY`

function scheduler (req, res) {
  let total = 0
  let amountPublished = 0

  fs.writeFile(`.job.scheduler`, moment.utc().format(defaultFormat) + `\n`)
  winston.debug(`[job] Worker %s executing job@%s`, process.pid, pkg.version)
  Article.find({ status: `publish` }).populate(`author`).exec(found)

  function found (err, articles) {
    if (err || !articles || articles.length === 0) {
      done(err); return
    }
    total = articles.length
    winston.debug(`[job] Found %s articles slated for publication`, total)
    contra.each(articles, 2, single, done)
  }

  function single (article, next) {
    contra.waterfall([
      function attemptPublication (next) {
        articlePublishService.publish(article, next)
      },
      function notifySubscribers (published, next) {
        let when
        if (published) {
          article.save(saved) // save the status change first!
        } else {
          if (article.publication) {
            when = moment.utc(article.publication)
            winston.debug(`[job] Article "%s" will be published %s (%s).`, article.title, when.fromNow(), when.format(defaultFormat))
          }
          next()
        }

        function saved (err) {
          if (err) {
            next(err); return
          }
          amountPublished++
          articleSubscriberService.share(article, promoted)
          winston.info(`[job] Published "%s".`, article.title)
        }

        function promoted (err) {
          if (err) {
            winston.error(`[job] Article campaign failed for "%s".`, article.title, { stack: err.stack || err.message || err || `(unknown)` })
          }
          next(err)
        }
      }
    ], next)
  }

  function done (err) {
    if (err) {
      winston.error(`[job] Cron job failed!`, { stack: err.stack || err.message || err || `(unknown)` })
      res.status(500).json({})
    }
    winston.debug(`[job] Published %s/%s articles.`, amountPublished, total)
    res.json({})
  }
}

module.exports = scheduler
