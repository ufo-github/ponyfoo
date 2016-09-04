'use strict';

const _ = require(`lodash`);
const fs = require(`fs`);
const path = require(`path`);
const mkdirp = require(`mkdirp`);
const sitemap = require(`sitemap`);
const contra = require(`contra`);
const winston = require(`winston`);
const moment = require(`moment`);
const Article = require(`../models/Article`);
const WeeklyIssue = require(`../models/WeeklyIssue`);
const userService = require(`./user`);
const oreillyService = require(`./oreilly`);
const env = require(`../lib/env`);
const authority = env(`AUTHORITY`);
const location = path.resolve(`.bin/static/sitemap.xml`);
const api = contra.emitter({
  built: false, rebuild, location
});

function getArticleUrls (articles) {
  const tags = _(articles).map(`tags`).flatten().uniq().value();
  const tagUrls = tags.map(tagUrl);
  const dates = _.map(articles, `publication`).reduce(dateTransformer, { year: {}, month: {}, day: {} });
  const dateUrls = _(dates).values().map(_.values).flatten().value();
  const articleUrls = articles.map(articleUrl);
  const modified = toLastMod(articles[0] ? articles[0].updated : Date.now());
  const urls = _.flatten([articleUrls, basics(modified), tagUrls, dateUrls]);
  return urls;
}

function getWeeklyUrls (modified, weeklies) {
  return [
    { url: `/weekly`, changefreq: `daily`, lastmod: modified, priority: 1 },
    { url: `/weekly/history`, changefreq: `daily`, lastmod: modified, priority: 1 },
    { url: `/weekly/sponsor`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    ...weeklies.map(weekly => ({
      url: `/weekly/` + weekly.slug,
      changefreq: `daily`,
      priority: 1,
      lastmod: toLastMod(weekly.updated)
    }))
  ];
}

function getOtherUrls (modified) {
  return [
    { url: `/speaking`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    { url: `/presentations`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    { url: `/opensource`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    { url: `/about`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    { url: `/license`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    { url: `/privacy`, changefreq: `weekly`, lastmod: modified, priority: 1 }
  ];
}

function getBookUrls (modified, oreillySlugs) {
  return [
    { url: `/books`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    { url: `/books/javascript-application-design`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    ...oreillySlugs.reduce((before, slug) => [
      ...before,
      { url: `/books/${slug}`, changefreq: `weekly`, lastmod: modified, priority: 1 },
      { url: `/books/${slug}/chapters`, changefreq: `weekly`, lastmod: modified, priority: 1 }
    ], [])
  ];
}

function getContributorUrls (modified, contributors) {
  return [
    { url: `/contributors`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    { url: `/contributors/join-us`, changefreq: `weekly`, lastmod: modified, priority: 1 },
    ...contributors.map(({ user }) => (
      { url: `/contributors/` + user.slug, changefreq: `weekly`, lastmod: modified, priority: 1 }
    ))
  ];
}
function basics (modified) {
  return [
    { url: `/`, changefreq: `daily`, lastmod: modified, priority: 1 },
    { url: `/articles/history`, changefreq: `daily`, lastmod: modified, priority: 1 }
  ];
}

function tagUrl (tag) {
  return { url: `/articles/tagged/` + tag, changefreq: `weekly` };
}

function articleUrl (article) {
  return { url: `/articles/` + article.slug, changefreq: `weekly`, priority: 1, lastmod: toLastMod(article.updated) };
}

function toLastMod (date) {
  return moment.utc(date).format(`YYYY-MM-DD`);
}

function dateTransformer (accumulator, date) {
  const mo = moment.utc(date);
  const year = mo.format(`YYYY`);
  const month = year + `/` + mo.format(`MM`);
  const day = month + `/` + mo.format(`DD`);

  if (!accumulator.year[year]) {
    accumulator.year[year] = { url: `/articles/` + year, changefreq: `monthly`, priority: 0.4 };
  }
  if (!accumulator.month[month]) {
    accumulator.month[month] = { url: `/articles/` + month, changefreq: `monthly`, priority: 0.4 };
  }
  if (!accumulator.day[day]) {
    accumulator.day[day] = { url: `/articles/` + day, changefreq: `monthly`, priority: 0.4 };
  }
  return accumulator;
}

function rebuild () {
  if (api.built && moment(api.built).add(30, `minutes`).isBefore(moment())) {
    end(); return;
  }
  contra.concurrent({
    articles: fetchArticles,
    weeklies: fetchWeeklies,
    oreillySlugs: oreillyService.findSlugs,
    users: userService.findActiveContributors
  }, models);

  function models (err, { articles, weeklies, oreillySlugs, users } = {}) {
    if (err) {
      end(err); return;
    }
    const modified = toLastMod(articles[0] ? articles[0].updated : Date.now());
    const urls = [
      ...getArticleUrls(articles),
      ...getWeeklyUrls(modified, weeklies),
      ...getBookUrls(modified, oreillySlugs),
      ...getContributorUrls(modified, users),
      ...getOtherUrls(modified)
    ];
    const map = sitemap.createSitemap({
      hostname: authority,
      cacheTime: 15 * 60 * 1000, // 15 minutes
      urls: urls
    });
    const xml = map.toXML();
    persist(xml, end);
  }
}

function fetchArticles (next) {
  Article.find({ status: `published` }).sort(`-publication`).lean().exec(next);
}

function fetchWeeklies (next) {
  WeeklyIssue.find({ status: `released`, statusReach: `everyone` }).lean().sort(`-publication`).exec(next);
}

function persist (xml, next) {
  mkdirp.sync(path.dirname(location));
  fs.writeFile(location, xml, next);
}

function end (err) {
  if (err) {
    winston.warn(`Error trying to regenerate sitemap`, err); return;
  }
  winston.debug(`Regenerated sitemap`);
  api.built = moment();
  api.emit(`built`);
}

module.exports = api;
