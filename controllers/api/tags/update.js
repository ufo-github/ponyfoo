'use strict'

const winston = require(`winston`)
const sluggish = require(`sluggish`)
const KnownTag = require(`../../../models/KnownTag`)
const markupService = require(`../../../services/markup`)
const summaryService = require(`../../../services/summary`)

module.exports = function (req, res, next) {
  const slug = req.params.slug
  const editing = !!slug
  if (editing) {
    KnownTag
      .findOne({ slug: slug })
      .exec(found)
  } else {
    updateAndSave(new KnownTag())
  }

  function found (err, tag) {
    if (err) {
      next(err); return
    }
    if (!tag) {
      next(`route`); return
    }
    updateAndSave(tag)
  }

  function updateAndSave (tag) {
    const { body } = req
    tag.slug = sluggish(body.slug)
    tag.title = body.title
    tag.titleHtml = markupService.compile(body.title)
    tag.titleText = summaryService.summarize(tag.titleHtml).text
    tag.description = body.description
    tag.descriptionHtml = markupService.compile(body.description)
    tag.descriptionText = summaryService.summarize(tag.descriptionHtml).text
    tag.save(saved)
  }

  function saved (err) {
    if (err) {
      winston.error(err)
    }
    res.redirect(`/articles/tags/review`)
  }
}
