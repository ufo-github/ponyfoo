'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var util = require('util');
var RSS = require('rss');
var mkdirp = require('mkdirp');
var contra = require('contra');
var moment = require('moment');
var winston = require('winston');
var assign = require('assignment');
var staticService = require('./static');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var contact = 'Nicolás Bevacqua <feed@ponyfoo.com>';
var feedService = {
  from: from,
  feeds: {}
};

function from (options) {
  var api = assign(options, contra.emitter({
    built: false,
    rebuild: rebuild,
    location: path.resolve('.bin/static/' + options.id + '.xml')
  }));
  feedService.feeds[options.id] = api;
  return api;

  function generate (items, done) {
    var now = moment();
    var tags = _(items)
      .pluck('categories')
      .flatten()
      .unique()
      .value();
    var feed = new RSS({
      generator: 'bevacqua/ponyfoo',
      title: options.title,
      description: options.description,
      feed_url: authority + options.href,
      site_url: authority,
      image_url: authority + staticService.unroll('/img/thumbnail.png'),
      author: contact,
      managingEditor: contact,
      webMaster: contact,
      copyright: util.format('%s, %s', contact, now.format('YYYY')),
      language: 'en',
      categories: tags,
      pubDate: now.clone().toDate(),
      ttl: 15
    });

    _.sortByOrder(items, ['date'], ['desc']).forEach(insert);
    done(null, feed.xml());

    function insert (feedItem) {
      feed.item(feedItem);
    }
  }
  function persist (xml, done) {
    mkdirp.sync(path.dirname(options.location));
    fs.writeFile(options.location, xml, done);
  }

  function rebuild () {
    contra.waterfall([options.getFeed, generate, persist], done);

    function done (err) {
      if (err) {
        winston.warn('Error trying to regenerate RSS feed (%s)', options.id, err); return;
      }
      winston.debug('Regenerated RSS feed (%s)', options.id);
      options.built = true;
      options.emit('built');
    }
  }
}

module.exports = feedService;
