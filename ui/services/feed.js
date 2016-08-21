'use strict';

const _ = require(`lodash`);
const fs = require(`fs`);
const path = require(`path`);
const util = require(`util`);
const RSS = require(`rss`);
const mkdirp = require(`mkdirp`);
const contra = require(`contra`);
const moment = require(`moment`);
const winston = require(`winston`);
const assign = require(`assignment`);
const staticService = require(`./static`);
const env = require(`../lib/env`);
const authority = env(`AUTHORITY`);
const contact = `Nicolás Bevacqua <feed@ponyfoo.com>`;
const feedService = {
  from: from,
  feeds: {}
};

function from (options) {
  const api = assign(options, contra.emitter({
    built: false,
    rebuild: rebuild,
    location: path.resolve(`.bin/static/` + options.id + `.xml`)
  }));
  feedService.feeds[options.id] = api;
  return api;

  function generate (items, done) {
    const now = moment.utc();
    const tags = _(items)
      .map(`categories`)
      .flatten()
      .uniq()
      .value();
    const feed = new RSS({
      generator: `ponyfoo/ponyfoo`,
      title: options.title,
      description: options.description,
      feed_url: authority + options.href,
      site_url: authority,
      image_url: authority + staticService.unroll(`/img/banners/branded.png`),
      author: contact,
      managingEditor: contact,
      webMaster: contact,
      copyright: util.format(`%s, %s`, contact, now.format(`YYYY`)),
      language: `en`,
      categories: tags,
      pubDate: now.clone().toDate(),
      ttl: 15
    });

    _.orderBy(items, [`date`], [`desc`]).forEach(insert);
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
        winston.warn(`Error trying to regenerate RSS feed (%s)`, options.id, err); return;
      }
      winston.debug(`Regenerated RSS feed (%s)`, options.id);
      options.built = true;
      options.emit(`built`);
    }
  }
}

module.exports = feedService;
