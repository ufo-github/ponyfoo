'use strict';

var fs = require('fs');
var contra = require('contra');
var winston = require('winston');
var moment = require('moment');
var Article = require('../../../models/Article');
var pkg = require('../../../package.json');
var articleService = require('../../../services/article');
var articlePublishService = require('../../../services/articlePublish');
var defaultFormat = 'HH:mm:ss -- DD MMMM, YYYY';

function scheduler (req, res, next) {
  var total = 0;
  var amountPublished = 0;

  fs.writeFile('.job.scheduler', moment().format(defaultFormat) + '\n');
  winston.debug('[job] Worker %s executing job@%s', process.pid, pkg.version);
  Article.find({ status: 'publish' }, found);

  function found (err, articles) {
    if (err || !articles || articles.length === 0) {
      done(err); return;
    }
    total = articles.length;
    winston.debug('[job] Found %s articles slated for publication', total);
    contra.each(articles, 2, single, done);
  }

  function single (article, next) {
    contra.waterfall([
      function attemptPublication (next) {
        articlePublishService.publish(article, next);
      },
      function notifySubscribers (published, next) {
        var when;
        if (published) {
          article.save(saved); // save the status change first!
        } else {
          if (article.publication) {
            when = moment(article.publication);
            winston.debug('[job] Article "%s" will be published %s (%s).', article.title, when.fromNow(), when.format(defaultFormat));
          }
          next();
        }

        function saved (err) {
          if (err) {
            next(err); return;
          }
          amountPublished++;
          articleService.campaign(article, promoted);
          winston.info('[job] Published "%s".', article.title);
        }

        function promoted (err) {
          if (err) {
            winston.error('[job] Article campaign failed for "%s".\n%s', article.title, err.stack || err);
          }
          next(err);
        }
      }
    ], next);
  }

  function done (err) {
    if (err) {
      winston.error('[job] Cron job failed!', err.stack || err);
      res.status(500).json({});
    }
    winston.debug('[job] Published %s/%s articles.', amountPublished, total);
    res.json({});
  }
}

module.exports = scheduler;
