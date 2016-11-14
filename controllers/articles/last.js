'use strict'

const Article = require(`../../models/Article`)
const redirect = require(`./lib/redirect`)

module.exports = function (req, res, next) {
  Article
    .find({ status: `published` })
    .sort(`-publication`)
    .limit(1)
    .exec(redirect(res, next))
}
