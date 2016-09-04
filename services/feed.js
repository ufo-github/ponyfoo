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
  from, feeds: {}
};

function from (options) {
  const location = path.resolve(`.bin/static/${options.id}.xml`);
  const api = assign({}, options, contra.emitter({
    built: false, rebuild, location
  }));
  feedService.feeds[api.id] = api;
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
      title: api.title,
      description: api.description,
      feed_url: authority + api.href,
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
    mkdirp.sync(path.dirname(api.location));
    fs.writeFile(api.location, xml, done);
  }

  function rebuild () {
    if (api.built && moment(api.built).add(30, `minutes`).isBefore(moment())) {
      end(); return;
    }

    contra.waterfall([api.getFeed, generate, persist], end);
  }

  function end (err) {
    if (err) {
      winston.warn(`Error trying to regenerate RSS feed (%s)`, api.id, err); return;
    }
    winston.debug(`Regenerated RSS feed (%s)`, api.id);
    api.built = moment();
    api.emit(`built`);
  }
}

module.exports = feedService;
