'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var sitemap = require('sitemap');
var contra = require('contra');
var winston = require('winston');
var moment = require('moment');
var Article = require('../models/Article');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var location = path.join(__dirname, '../.bin/static/sitemap.xml');

function generate (articles, done) {
  var all = articles.map(toObject);
  var tags = _(all).pluck('tags').flatten().unique().value();
  var tagUrls = tags.map(tagUrl);
  var dates = _.pluck(all, 'publication').reduce(dateTransformer, { year: {}, month: {}, day: {} });
  var dateUrls = _(dates).values().map(_.values).flatten().value();
  var articleUrls = all.map(articleUrl);
  var modified = toLastMod(all[0] ? all[0].updated : Date.now());
  var urls = _.flatten([articleUrls, basics(modified), tagUrls, dateUrls]);
  var map = sitemap.createSitemap({
    hostname: authority,
    cacheTime: 15 * 60 * 1000, // 15 minutes
    urls: urls
  });

  done(null, map.toXML());
}

function basics (modified) {
  return [
    { url: '/', changeFreq: 'daily', lastmod: modified }
  ];
}

function tagUrl (tag) {
  return { url: '/articles/tagged/' + tag, changeFreq: 'weekly' };
}

function articleUrl (article) {
  return { url: article.permalink, changeFreq:' weekly', priority: 1, lastmod: toLastMod(article.updated) };
}

function toObject (article) {
  return article.toObject();
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
    accumulator.year[year] = { url: '/articles/' + year, changeFreq: 'monthly', priority: 0.4 };
  }
  if (!accumulator.month[month]) {
    accumulator.month[month] = { url: '/articles/' + month, changeFreq: 'monthly', priority: 0.4 };
  }
  if (!accumulator.day[day]) {
    accumulator.day[day] = { url: '/articles/' + day, changeFreq: 'monthly', priority: 0.4 };
  }
  return accumulator;
}

function rebuild () {
  contra.waterfall([fetch, generate, persist], done);

  function fetch (next) {
    Article.find({ status: 'published' }).sort('-publication').exec(next);
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
  }
}

module.exports = {
  rebuild: rebuild
};
