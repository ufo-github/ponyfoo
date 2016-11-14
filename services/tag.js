'use strict'

const _ = require(`lodash`)
const contra = require(`contra`)
const Article = require(`../models/Article`)
const KnownTag = require(`../models/KnownTag`)

function getAll (done) {
  const tasks = {
    plainTags: findTags,
    knownTags: findKnownTags
  }

  contra.concurrent(tasks, merge)

  function findTags (next) {
    Article.find({}).distinct(`tags`).lean().exec(next)
  }

  function findKnownTags (next) {
    KnownTag.find({}).lean().exec(next)
  }

  function merge (err, result) {
    if (err) {
      done(err); return
    }
    const plainTags = result.plainTags
    const used = plainTags.map(asTagSlug)
    const unused = result.knownTags.filter(addKnownAsUsedTags).map(toKnownTagModel)

    done(null, {
      used: _.sortBy(used, `slug`),
      unused: _.sortBy(unused, `slug`)
    })

    function addKnownAsUsedTags (knownTag) {
      const i = plainTags.indexOf(knownTag.slug)
      if (i === -1) {
        return true
      }
      used[i] = toKnownTagModel(knownTag)
    }
  }
}

function asTagSlug (tag) {
  return { slug: tag }
}

function toKnownTagModel (tag) {
  return {
    slug: tag.slug,
    titleHtml: tag.titleHtml,
    descriptionHtml: tag.descriptionHtml,
    known: true
  }
}

module.exports = {
  getAll: getAll,
  toKnownTagModel: toKnownTagModel
}
