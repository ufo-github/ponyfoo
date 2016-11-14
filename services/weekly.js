'use strict'

const _ = require(`lodash`)
const but = require(`but`)
const WeeklyIssue = require(`../models/WeeklyIssue`)
const weeklyCompilerService = require(`./weeklyCompiler`)
const weeklyCompilerLinkService = require(`./weeklyCompilerLink`)
const commentService = require(`./comment`)
const datetimeService = require(`./datetime`)
const summaryService = require(`./summary`)
const markupService = require(`./markup`)
const userService = require(`./user`)
const htmlService = require(`./html`)
const cryptoService = require(`./crypto`)
const rdigits = /^\d+$/

function compileSections (model, done) {
  const json = model.toJSON ? model.toJSON() : model
  const { slug, sections } = json
  const options = {
    markdown: markupService,
    slug: friendlySlug(slug)
  }
  weeklyCompilerService.compile(sections, options, compiled)
  function compiled (err, html) {
    if (err) {
      done(err); return
    }
    const absolutized = htmlService.absolutize(html)
    done(null, absolutized)
  }
}

function friendlySlug (slug) {
  return rdigits.test(slug) ? `issue-` + slug : slug
}

function compile (model, done) {
  compileSections(model, compiled)
  function compiled (err, html) {
    if (err) {
      done(err); return
    }
    const linkThrough = weeklyCompilerLinkService.linkThroughForSlug(friendlySlug(model.slug))
    model.titleHtml = markupService.compile(model.title, {
      absolutize: true,
      linkThrough: linkThrough
    })
    model.titleText = summaryService.summarize(model.titleHtml).text
    model.summaryHtml = markupService.compile(model.summary, {
      absolutize: true,
      linkThrough: linkThrough
    })
    model.summaryText = summaryService.summarize(model.summaryHtml).text
    model.contentHtml = html
    done(null, model)
  }
}

function insert (model, done) {
  compile(model, compiled)
  function compiled (err, model) {
    if (err) {
      done(err); return
    }
    const doc = new WeeklyIssue(model)
    doc.save(but(done))
  }
}

function addSection ({ issue, section }, done) {
  issue.updated = Date.now()
  issue.sections.push(section)
  compileSections(issue, save)

  function save (err, html) {
    if (err) {
      done(err); return
    }
    issue.contentHtml = html
    issue.save(but(done))
  }
}

function update (options, done) {
  const query = { slug: options.slug }
  const model = options.model
  WeeklyIssue.findOne(query, found)
  function found (err, issue) {
    if (err) {
      done(err); return
    }
    if (!issue) {
      done(new Error(`Weekly issue not found.`)); return
    }
    compile(model, compiled)
    function compiled (err, model) {
      if (err) {
        done(err); return
      }
      if (issue.status !== `released`) {
        issue.status = model.status
      }
      const rstrip = /^\s*<p>\s*<\/p>\s*$/i
      issue.updated = Date.now()
      issue.slug = model.slug
      issue.sections = model.sections
      issue.title = model.title
      issue.titleHtml = (model.titleHtml || ``).replace(rstrip, ``)
      issue.titleText = model.titleText
      issue.summary = model.summary
      issue.summaryHtml = model.summaryHtml
      issue.summaryText = model.summaryText
      issue.contentHtml = model.contentHtml
      updateFlag(`email`)
      updateFlag(`tweet`)
      updateFlag(`fb`)
      updateFlag(`echojs`)
      updateFlag(`hn`)
      issue.save(but(done))

      function updateFlag (key) {
        if (typeof model[key] === `boolean`) {
          issue[key] = model[key]
        }
      }
    }
  }
}

function getAllTags (weeklyIssue) {
  return _(weeklyIssue.sections)
    .map(toTags)
    .flatten()
    .concat([`javascript`, `css`])
    .uniq()
    .value()
  function toTags (section) {
    return section.tags || []
  }
}

function toMetadata (doc) {
  const released = doc.status === `released`
  const patrons = doc.statusReach === `patrons`
  const everyone = doc.statusReach === `everyone`
  const permalink = getPermalink()
  return {
    created: datetimeService.field(doc.created),
    publication: datetimeService.field(doc.publication),
    author: {
      slug: doc.author.slug,
      avatar: userService.getAvatar(doc.author)
    },
    name: doc.computedName,
    title: doc.computedTitle,
    titleHtml: doc.titleHtml,
    slug: doc.slug,
    status: doc.status,
    statusReach: doc.statusReach,
    shareable: released && everyone,
    permalink: permalink
  }
  function getPermalink () {
    const base = `/weekly/` + doc.slug
    if (!released) {
      return base + `?verify=` + hash(doc.created)
    } else if (patrons) {
      return base + `?thanks=` + hash(doc.thanks)
    }
    return base
  }
  function hash (value) {
    return cryptoService.md5(doc._id + value)
  }
}

function toView (doc) {
  return commentService.hydrate({
    name: doc.computedName,
    title: doc.computedTitle,
    titleHtml: doc.titleHtml,
    slug: doc.slug,
    publication: datetimeService.field(doc.publication),
    status: doc.status,
    statusReach: doc.statusReach,
    summaryHtml: doc.summaryHtml,
    contentHtml: doc.contentHtml
  }, doc)
}

function toHistory (doc) {
  return {
    name: doc.computedName,
    title: doc.computedTitle,
    titleHtml: doc.titleHtml,
    slug: doc.slug,
    publication: datetimeService.field(doc.publication)
  }
}

module.exports = {
  compile,
  compileSections,
  insert,
  update,
  addSection,
  toMetadata,
  toView,
  toHistory,
  getAllTags
}
