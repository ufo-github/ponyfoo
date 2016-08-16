'use strict';

const _ = require(`lodash`);
const google = require(`googleapis`);
const env = require(`../lib/env`);
const Article = require(`../models/Article`);
const email = env(`GA_EMAIL`);
const privateKey = env(`GA_PRIVATE_KEY`);
const profile = env(`GA_PROFILE`);
const enabled = env(`POPULAR_ARTICLES`);
const analyticsScope = `https://www.googleapis.com/auth/analytics.readonly`;
const rdigits = /^[\d.]+$/;

function getArticles (done) {
  if (!enabled || !email || !privateKey || !profile) {
    done(null, []); return;
  }
  const jwt = new google.auth.JWT(
    email,
    null,
    privateKey,
    [analyticsScope],
    null
  );
  jwt.authorize(authorized);
  function authorized (err) {
    if (err) {
      done(err); return;
    }
    const query = {
      auth: jwt,
      ids: `ga:` + profile,
      'start-date': `2012-12-25`,
      'end-date': `today`,
      'max-results': 50,
      metrics: [
        `ga:pageviews`,
        `ga:uniquePageviews`,
        `ga:timeOnPage`,
        `ga:bounces`,
        `ga:entrances,ga:exits`,
      ].join(),
      dimensions: `ga:pagePath`,
      sort: `-ga:pageviews`
    };
    google.analytics(`v3`).data.ga.get(query, got);
  }
  function got (err, result) {
    if (err) {
      done(err); return;
    }
    const popular = _(result.rows
      .filter(butHome)
      .map(toSlug)
      .reduce(bySlug, {})
    )
      .values()
      .orderBy([`row.1`], [`desc`])
      .map(`slug`)
      .slice(0, 20)
      .value();

    const query = {
      status: `published`,
      slug: { $in: popular }
    };
    Article
      .find(query)
      .lean()
      .select(`-_id publication slug titleHtml tags`)
      .exec(found);

    function found (err, articles) {
      if (err) {
        done(err); return;
      }
      done(null, articles.sort(byPopularity));
    }
    function byPopularity (a, b) {
      const left = popular.indexOf(a.slug);
      const right = popular.indexOf(b.slug);
      return left - right;
    }
  }
}

function butHome (row) {
  return row[0] !== `/`;
}

function toSlug (row) {
  return {
    row: row.map(parseInts),
    slug: row[0].slice(row[0].lastIndexOf(`/`) + 1)
  };
}

function parseInts (column) {
  if (rdigits.test(column)) {
    return parseInt(column);
  }
  return column;
}

function bySlug (popular, entry) {
  if (entry.slug in popular) {
    popular[entry.slug].row.forEach(merge);
  } else {
    popular[entry.slug] = entry;
  }
  return popular;
  function merge (column, i, row) {
    if (typeof column === `number`) {
      row[i] += entry.row[i];
    }
  }
}

module.exports = {
  getArticles: getArticles
};
