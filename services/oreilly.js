'use strict'

const glob = require(`glob`)
const path = require(`path`)
const moment = require(`moment`)
const assign = require(`assignment`)
const contra = require(`contra`)
const markdownFileService = require(`./markdownFile`)
const settingService = require(`./setting`)
const staticService = require(`./static`)
const dat = `./dat/oreilly-books`
const globPattern = `${dat}/*`
const getSetting = settingService.tracker()

function getMetadata ({ bookSlug, includeNonLive }, done) {
  findSlugs(includeNonLive, (err, slugs) => {
    if (err) {
      done(err); return
    }
    if (slugs.indexOf(bookSlug) === -1) {
      done(null, null); return
    }
    pullMetadata()
  })

  function pullMetadata () {
    const metaModule = path.resolve(`${dat}/${bookSlug}/meta`)
    const summaryFile = `${dat}/${bookSlug}/summary.md`
    const linksFile = `${dat}/${bookSlug}/links.md`
    const homeFile = `${dat}/${bookSlug}/home.md`

    contra.concurrent({
      meta: next => next(null, require(metaModule)), // eslint-disable-line global-require
      files: next => contra.concurrent({
        summaryHtml: next => markdownFileService.read(summaryFile, next),
        linksHtml: next => markdownFileService.read(linksFile, next),
        homeHtml: next => markdownFileService.read(homeFile, next)
      }, next)
    }, respond)
  }

  function respond (err, { meta, files } = {}) {
    if (err) {
      done(err); return
    }
    const metadata = assign({}, meta, files, {
      coverHref: staticService.unroll(meta.coverHref),
      publicationYear: moment(meta.publication).format(`YYYY`)
    })
    done(null, metadata)
  }
}

function mapPathsToSlugs (paths) {
  return paths.map(p => path.basename(p))
}

function findSlugsSync () {
  return mapPathsToSlugs(glob.sync(globPattern))
}

function findSlugs (includeNonLive, done) {
  if (!done) {
    done = includeNonLive
    includeNonLive = null
  }
  contra.concurrent({
    enabled: contra.curry(getSetting, `LIVE_OREILLY_BOOKS`),
    paths: contra.curry(glob, globPattern)
  }, filterSlugs)

  function filterSlugs (err, { enabled = [], paths = [] } = {}) {
    const slugs = mapPathsToSlugs(paths)
    const filtered = includeNonLive ? slugs : slugs.filter(whereLive(enabled))
    done(err, filtered)
  }
}

function getAllMetadata (done) {
  findSlugs((err, slugs) => {
    if (err) {
      done(err); return
    }
    contra.map(slugs.map(slug => ({ bookSlug: slug })), getMetadata, done)
  })
}

function whereLive (live) {
  return slug => live.indexOf(slug) !== -1
}

module.exports = {
  getMetadata,
  getAllMetadata,
  findSlugs,
  findSlugsSync
}
