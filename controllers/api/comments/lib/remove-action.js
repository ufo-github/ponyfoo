'use strict'

const contra = require(`contra`)
const assign = require(`assignment`)
const Article = require(`../../../../models/Article`)
const WeeklyIssue = require(`../../../../models/WeeklyIssue`)
const hostTypes = {
  articles: {
    name: `Article`,
    schema: Article,
    query: { status: `published` },
    topic: `articles`
  },
  weeklies: {
    name: `Weekly issue`,
    schema: WeeklyIssue,
    query: { status: `released` },
    topic: `newsletter`
  }
}

function removeAction (req, res, next, done) {
  const hostType = hostTypes[req.params.type]
  const id = req.params.id

  contra.waterfall([lookup, found, removal], handle)

  function lookup (next) {
    hostType.schema
      .findOne(assign({ slug: req.params.slug }, hostType.query))
      .populate(`comments`)
      .exec(next)
  }

  function found (host, next) {
    const comment = host.comments.id(id)
    if (!comment) {
      done(`not found`); return
    }
    next(null, host)
  }

  function removal (host, next) {
    const comment = host.comments.id(id)
    const children = host.comments.filter(sameThread);

    [comment].concat(children).forEach(removeAll)
    host.save(saved)

    function sameThread (comment) {
      return comment.parent && comment.parent.equals(id)
    }
    function removeAll (comment) {
      comment.remove()
    }
    function saved (err) {
      next(err)
    }
  }

  function handle (err) {
    if (err) {
      next(err); return
    }
    done(`success`)
  }
}

module.exports = removeAction
