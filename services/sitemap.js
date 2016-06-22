'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var sitemap = require('sitemap');
var contra = require('contra');
var winston = require('winston');
var moment = require('moment');
var User = require('../models/User');
var Article = require('../models/Article');
var WeeklyIssue = require('../models/WeeklyIssue');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var location = path.resolve('.bin/static/sitemap.xml');
var api = contra.emitter({
  built: false,
  rebuild: rebuild,
  location: location
});

function getArticleUrls (articles) {
  var tags = _(articles).pluck('tags').flatten().unique().value();
  var tagUrls = tags.map(tagUrl);
  var dates = _.pluck(articles, 'publication').reduce(dateTransformer, { year: {}, month: {}, day: {} });
  var dateUrls = _(dates).values().map(_.values).flatten().value();
  var articleUrls = articles.map(articleUrl);
  var modified = toLastMod(articles[0] ? articles[0].updated : Date.now());
  var urls = _.flatten([articleUrls, basics(modified), tagUrls, dateUrls]);
  return urls;
}

function getWeeklyUrls (weeklies) {
  return weeklies.map(function (weekly) {
    return {
      url: '/weekly/' + weekly.slug,
      changefreq: 'daily',
      priority: 1,
      lastmod: toLastMod(weekly.updated)
    };
  });
}

function getOtherUrls (modified) {
  return [
    { url: '/weekly', changefreq: 'daily', lastmod: modified, priority: 1 },
    { url: '/weekly/history', changefreq: 'daily', lastmod: modified, priority: 1 },
    { url: '/weekly/sponsor', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/books', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/books/javascript-application-design', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/speaking', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/presentations', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/opensource', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/about', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/license', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/privacy', changefreq: 'weekly', lastmod: modified, priority: 1 }
  ];
}

function getContributorUrls (users, modified) {
  return [
    { url: '/contributors', changefreq: 'weekly', lastmod: modified, priority: 1 },
    { url: '/contributors/join-us', changefreq: 'weekly', lastmod: modified, priority: 1 }
  ].concat(users.filter(whereHasSlug).map(toContributor));
  function whereHasSlug (user) {
    return user.slug;
  }
  function toContributor (user) {
    return { url: '/contributors/' + user.slug, changefreq: 'weekly', lastmod: modified, priority: 1 };
  }
}
function basics (modified) {
  return [
    { url: '/', changefreq: 'daily', lastmod: modified, priority: 1 },
    { url: '/articles/history', changefreq: 'daily', lastmod: modified, priority: 1 }
  ];
}

function tagUrl (tag) {
  return { url: '/articles/tagged/' + tag, changefreq: 'weekly' };
}

function articleUrl (article) {
  return { url: '/articles/' + article.slug, changefreq: 'weekly', priority: 1, lastmod: toLastMod(article.updated) };
}

function toLastMod (date) {
  return moment(date).zone(0).format('YYYY-MM-DD');
}

function dateTransformer (accumulator, date) {
  var mo = moment(date).zone(0);
  var year = mo.format('YYYY');
  var month = year + '/' + mo.format('MM');
  var day = month + '/' + mo.format('DD');

  if (!accumulator.year[year]) {
    accumulator.year[year] = { url: '/articles/' + year, changefreq: 'monthly', priority: 0.4 };
  }
  if (!accumulator.month[month]) {
    accumulator.month[month] = { url: '/articles/' + month, changefreq: 'monthly', priority: 0.4 };
  }
  if (!accumulator.day[day]) {
    accumulator.day[day] = { url: '/articles/' + day, changefreq: 'monthly', priority: 0.4 };
  }
  return accumulator;
}

function rebuild () {
  contra.concurrent({
    articles: fetchArticles,
    weeklies: fetchWeeklies,
    users: fetchUsers
  }, models);

  function models (err, result) {
    if (err) {
      done(err); return;
    }
    var modified = toLastMod(result.articles[0] ? result.articles[0].updated : Date.now());
    var urls = getArticleUrls(result.articles)
      .concat(getWeeklyUrls(result.weeklies))
      .concat(getContributorUrls(result.users, modified))
      .concat(getOtherUrls(modified));
    var map = sitemap.createSitemap({
      hostname: authority,
      cacheTime: 15 * 60 * 1000, // 15 minutes
      urls: urls
    });
    var xml = map.toXML();
    persist(xml, done);
  }
}

function fetchArticles (next) {
  Article.find({ status: 'published' }).sort('-publication').lean().exec(next);
}

function fetchWeeklies (next) {
  WeeklyIssue.find({ status: 'released', statusReach: 'everyone' }).lean().sort('-publication').exec(next);
}

function fetchUsers (next) {
  User.find({ roles: { $in: ['owner', 'articles'] } }).lean().sort('created').exec(next);
}

function persist (xml, next) {
  mkdirp.sync(path.dirname(location));
  fs.writeFile(location, xml, next);
}

function done (err) {
  if (err) {
    winston.warn('Error trying to regenerate sitemap', err); return;
  }
  winston.debug('Regenerated sitemap');
  api.built = true;
  api.emit('built');
}

module.exports = api;
