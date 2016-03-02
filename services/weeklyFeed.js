'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var RSS = require('rss');
var contra = require('contra');
var winston = require('winston');
var util = require('util');
var moment = require('moment');
var WeeklyIssue = require('../models/WeeklyIssue');
var env = require('../lib/env');
var markupService = require('./markup');
var staticService = require('./static');
var weeklyService = require('./weekly');
var authority = env('AUTHORITY');
var contact = 'Nicolás Bevacqua <hello@ponyfoo.com>';
var location = path.resolve('.bin/static/weekly.xml');
var api = contra.emitter({
  built: false,
  rebuild: rebuild,
  location: location
});

function generate (weeklies, done) {
  var htmls = Object.create(null);
  var tags = _(weeklies).pluck('tags').flatten().unique().value();
  var now = moment();
  var feed = new RSS({
    title: 'Pony Foo Weekly',
    description: 'Latest Pony Foo Weekly issues',
    generator: 'bevacqua/ponyfoo',
    feed_url: authority + '/weekly/feed',
    site_url: authority,
    image_url: authority + staticService.unroll('/img/thumbnail.png'),
    author: contact,
    managingEditor: contact,
    webMaster: contact,
    copyright: util.format('%s, %s', contact, now.format('YYYY')),
    language: 'en',
    categories: tags,
    pubDate: now.clone().toDate(),
    ttl: 15,
  });

  contra.each(weeklies, absolutize, fill);

  function absolutize (weekly, next) {
    var fullHtml = '<div>' + weekly.contentHtml + '</div>';
    var compiled = markupService.compile(fullHtml, {
      markdown: false,
      absolutize: true
    });
    htmls[weekly.slug] = compiled;
    next();
  }

  function fill (err) {
    if (err) {
      done(err); return;
    }

    weeklies.forEach(function insert (weekly) {
      feed.item({
        title: weekly.name + ' \u2014 Pony Foo Weekly',
        description: htmls[weekly.slug],
        url: authority + '/weekly/' + weekly.slug,
        categories: weeklyService.getAllTags(weekly),
        author: contact,
        date: moment(weekly.publication).toDate()
      });
    });

    done(null, feed.xml());
  }
}

function rebuild () {
  contra.waterfall([fetch, generate, persist], done);

  function fetch (next) {
    WeeklyIssue.find({ status: 'released', statusReach: 'everyone' }).sort('-publication').limit(20).exec(next);
  }

  function persist (xml, next) {
    mkdirp.sync(path.dirname(location));
    fs.writeFile(location, xml, next);
  }

  function done (err) {
    if (err) {
      winston.warn('Error trying to regenerate RSS feed (weeklies)', err); return;
    }
    winston.debug('Regenerated RSS feed (weeklies)');
    api.built = true;
    api.emit('built');
  }
}

module.exports = api;
