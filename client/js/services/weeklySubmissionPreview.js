'use strict'

const $ = require(`dominus`)
const markdownService = require(`../../../services/markdown`)
const textService = require(`../../../services/text`)

function getSectionModel (inputContainer, { href, subtype, sponsored } = {}) {
  const title = $(`.wa-link-title`, inputContainer)
  const description = $(`.wa-link-description`, inputContainer)
  const source = $(`.wa-link-source`, inputContainer)
  const sourceHref = $(`.wa-link-source-href`, inputContainer)
  const linkImageContainer = $(`.wa-link-image-container`, inputContainer)
  const tags = getTags()
  return {
    type: `link`,
    title: title.value(),
    href,
    subtype,
    sponsored,
    tags,
    foreground: `#1bc211`,
    background: `transparent`,
    source: source.value(),
    sourceHref: sourceHref.value(),
    image: linkImageContainer.but(`.uv-hidden`).find(`.wa-link-image`).value(),
    description: description.value()
  }
  function getTags () {
    const unknownTags = textService.splitTags($(`.wa-link-tags`, inputContainer).value())
    const knownTags = $(`.wa-link-tag`, inputContainer)
      .filter(byChecked)
      .map(toValue)
      .filter(unique(unknownTags))
    const allTags = unknownTags.concat(knownTags)
    return allTags
  }
  function byChecked (el) {
    return $(el).value()
  }
  function toValue (el) {
    return $(el).text()
  }
  function unique (unknownTags) {
    return tag => unknownTags.indexOf(tag) === -1
  }
}

function toggleTags (e) {
  const toggler = $(e.target)
  const content = toggler.parents(`.wa-section`).find(`.wa-link-tag-list`)
  toggleUsingButton(content, toggler, [`fa-flip-horizontal`, `fa-rotate-90`])
}

function toggleUsingButton (content, button, classes) {
  if (content.hasClass(`uv-hidden`)) {
    content.removeClass(`uv-hidden`)
    button.removeClass(classes[1])
    button.addClass(classes[0])
  } else {
    content.addClass(`uv-hidden`)
    button.addClass(classes[1])
    button.removeClass(classes[0])
  }
}

function getUpdatePreview (previewContainer, { weeklyCompilerService, inputContainer, getSectionModelInfo }) {
  return function updatePreview () {
    const section = getSectionModel(inputContainer, getSectionModelInfo())
    const options = {
      markdown: markdownService,
      slug: `submission-preview`
    }
    weeklyCompilerService.compile([section], options, compiled)
    function compiled (err, html) {
      if (err) {
        html = `<pre class="wa-error">${err}</pre>`
      }
      previewContainer.html(html)
    }
  }
}

module.exports = {
  getSectionModel,
  getUpdatePreview,
  toggleTags
}
