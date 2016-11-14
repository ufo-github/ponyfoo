'use strict'

const _ = require(`lodash`)
const RSS = require(`rss`)
const contra = require(`contra`)
const moment = require(`moment`)
const staticService = require(`./static`)
const syndicationService = require(`./syndication`)
const env = require(`../lib/env`)
const authority = env(`AUTHORITY`)
const contactEmail = `feed@ponyfoo.com`
const contactName = `Nicolás Bevacqua`
const feedContact = `${ contactEmail } (${ contactName })`
const feedService = {
  from,
  feeds: new Map()
}

function from (options) {
  const { id } = options
  const location = `.bin/static/${ id }.xml`
  const syn = syndicationService.create({
    name: `${ id } RSS feed`,
    location,
    build
  })
  feedService.feeds.set(id, syn)
  return syn

  function generate (items, done) {
    const now = moment.utc()
    const tags = _(items)
      .map(`categories`)
      .flatten()
      .uniq()
      .orderBy([`date`], [`desc`])
      .value()

    const feed = new RSS({
      title: options.title,
      description: options.description,
      generator: `ponyfoo/ponyfoo`,
      feed_url: authority + options.href,
      site_url: authority,
      image_url: authority + staticService.unroll(`/img/banners/branded.png`),
      managingEditor: feedContact,
      webMaster: feedContact,
      copyright: `${ contactName }, ${ now.format(`YYYY`) }`,
      language: `en`,
      categories: tags,
      pubDate: now.clone().toDate(),
      ttl: 15
    })

    items.forEach(item => feed.item(item))

    done(null, feed.xml())
  }

  function build (done) {
    contra.waterfall([options.getFeed, generate], done)
  }
}

module.exports = feedService
