'use strict';

var _ = require('lodash');
var RSS = require('rss');
var contra = require('contra');
var util = require('util');
var moment = require('moment');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var contact = 'Nicolas Bevacqua <nico@bevacqua.io>';

function generate (articles, done) {
  var absolutes = {};
  var tags = _(articles).pluck('tags').flatten().unique().value();
  var now = moment();
  var feed = new RSS({
    title: 'Pony Foo',
    description: 'Latest articles published on Pony Foo',
    generator: 'bevacqua/ponyfoo',
    feed_url: authority + '/articles/feed',
    site_url: authority,
    image_url: authority + '/img/ponyfoo.png',
    author: contact,
    managingEditor: contact,
    webMaster: contact,
    copyright: util.format('%s, %s', contact, now.format('YYYY')),
    language: 'en',
    categories: tags,
    pubDate: now.clone().toDate(),
    ttl: 20,
  });

  contra.each(articles, absolutize, fill);

  function absolutize (article, done) {
    htmlService.absolutize(article.introductionHtml, function (err, html) {
      if (err) {
        done(err); return;
      }
      absolutes[article._id] = html;
    });
  }

  function fill (err) {
    if (err) {
      done(err); return;
    }

    _.sort(articles, 'publication').reverse().forEach(function (article) {
      feed.item({
        title: article.title,
        description: absolutes[article._id],
        url: authority + article.permalink,
        categories: article.tags,
        author: contact
        date: moment(article.publication).toDate()
      });
    });

    var xml = feed.xml();

    console.log(xml);
  }
}

module.exports = {};
