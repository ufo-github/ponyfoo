'use strict';

const _ = require(`lodash`);
const moment = require(`moment`);
const contra = require(`contra`);
const but = require(`but`);
const util = require(`util`);
const winston = require(`winston`);
const env = require(`../lib/env`);
const Article = require(`../models/Article`);
const KnownTag = require(`../models/KnownTag`);
const articleElasticsearchService = require(`./articleElasticsearch`);
const articleFeedService = require(`./articleFeed`);
const articleService = require(`./article`);
const sitemapService = require(`./sitemap`);
const processing = {};

function query (input, options, done) {
  if (done === void 0) {
    done = options;
    options = {};
  }
  const tasks = {
    articles: findArticles,
    tags: findKnownTags
  };

  contra.concurrent(tasks, respond);

  function findArticles (next) {
    if (input.length) {
      elasticsearch();
    } else {
      findAll();
    }

    function elasticsearch () {
      articleElasticsearchService.query(input, options, findSubset);
    }

    function findSubset (err, results) {
      if (err) {
        next(err); return;
      }
      const scoreCard = results.reduce(toScoreCard, {});
      const ids = Object.keys(scoreCard);
      const query = { _id: { $in: ids } };
      options.sort = false;
      articleService.find(query, options, sortByElasticsearchScore);

      function toScoreCard (card, result) {
        card[result._id] = result._score;
        return card;
      }

      function sortByElasticsearchScore (err, articles) {
        if (err) {
          next(err); return;
        }
        next(null, articles.sort(byElasticsearchScore));
      }

      function byElasticsearchScore (left, right) {
        return getScore(right) - getScore(left);
      }

      function getScore (article) {
        return scoreCard[article._id];
      }
    }

    function findAll () {
      const query = {
        status: `published`,
        tags: { $all: options.tags }
      };
      articleService.find(query, { populate: `author` }, next);
    }
  }

  function findKnownTags (next) {
    KnownTag
      .find({ slug: { $in: options.tags } })
      .lean()
      .exec(next);
  }

  function respond (err, result) {
    if (err) {
      done(err); return;
    }
    done(null, result.articles, {
      tags: result.tags
    });
  }
}

function bracket (tag) {
  return util.format(`[%s]`, tag);
}

function format (terms, tags) {
  return util.format(`"%s"`, tags.map(bracket).concat(terms).join(` `));
}

function update (article, done) {
  const end = done || log;
  articleElasticsearchService.update(article, updated);
  function updated (err) {
    if (err) {
      end(err); return;
    }
    addRelated(article, end);
  }
}

function addRelated (article, done) {
  const end = done || log;
  if (processing[article._id]) {
    processing[article._id] = false;
    end(null);
    return;
  }
  processing[article._id] = true;

  const options = {
    since: moment.utc(`2014-01-01`, `YYYY-MM-DD`).toDate() // avoid floating terrible articles
  };

  articleElasticsearchService.related(article, options, queried);

  function queried (err, result) {
    if (err) {
      end(err); return;
    }
    article.related = _.map(result, `_id`);
    article.save(but(end));
  }
}

function addRelatedAll (done) {
  const end = done || log;
  env(`BULK_INSERT`, true);
  winston.info(`Computing relationships for articles site-wide`);
  contra.waterfall([
    function findAll (next) {
      Article.find({ status: `published` }, next);
    },
    function compute (articles, next) {
      contra.each(articles, 2, addRelatedArticles, but(next));
      function addRelatedArticles (article, next) {
        winston.debug(`Computing relationships for: "%s"`, article.slug);
        addRelated(article, save);
        function save (err) {
          if (err) {
            next(err); return;
          }
          winston.debug(`Computed relationships for: "%s"`, article.slug);
          article.save(but(next));
        }
      }
    }
  ], unbulk);
  function unbulk (err) {
    env(`BULK_INSERT`, false);
    if (err) {
      winston.warn(`Error computing relationships`, err);
      end(err); return;
    }
    winston.info(`Relationship computation completed`);
    articleFeedService.rebuild();
    sitemapService.rebuild();
    end(null);
  }
}

function log (err) {
  if (err) {
    winston.error(err);
  }
}

module.exports = {
  query: query,
  format: format,
  update: update,
  addRelated: addRelated,
  addRelatedAll: addRelatedAll
};
