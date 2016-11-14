'use strict'

const $ = require(`dominus`)
const sluggish = require(`sluggish`)

module.exports = function () {
  const title = $(`.tge-title`)
  const slug = $(`.tge-slug`)
  let boundSlug = true

  title.on(`keypress keydown paste input`, typingTitle)
  slug.on(`keypress keydown paste input`, typingSlug)

  function typingTitle () {
    if (boundSlug) {
      slug.value(sluggish(title.value()))
    }
  }

  function typingSlug () {
    boundSlug = false
  }
}
