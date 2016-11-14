'use strict'

const $ = require(`dominus`)
const taunus = require(`taunus`)
const queso = require(`queso`)
const bureaucracy = require(`bureaucracy`)
const scrapeCompletionService = require(`../services/scrapeCompletion`)
const body = $.findOne(`body`)

function bind () {
  taunus.on(`start`, setupUploads.bind(null, body))
  taunus.on(`render`, setupUploads)
}

function setupUploads (container) {
  $(container).find(`.bx-fileinput`).forEach(setup)
}

function setup (el) {
  const $el = $(el)
  const inputContainer = $el.parents(`.bx-icon`).prev(`.bx-input`)
  const input = inputContainer.find(`input`)
  const grayscale = input.attr(`data-grayscale`)
  const preserve = input.attr(`data-preserve-size`)
  const options = {}
  if (preserve) { options[`preserve-size`] = true }
  if (grayscale) { options.grayscale = true }
  const bureaucrat = bureaucracy.setup(el, {
    endpoint: `/api/images` + queso.stringify(options),
    validator: `image`
  })
  bureaucrat.on(`started`, loader())
  bureaucrat.on(`ended`, loader(`done`))
  bureaucrat.on(`success`, uploaded)

  function loader (state) {
    return applyStateClass
    function applyStateClass () {
      inputContainer[state === `done` ? `removeClass` : `addClass`](`bx-uploading`)
    }
  }

  function uploaded (results) {
    if (results.length === 0) {
      return
    }
    const result = results[0]
    input.value(result.href)
    input.emit(`bureaucrat`)
    updateThumbnailImage()
  }

  function updateThumbnailImage () {
    const $container = $el.parents(`.wa-section-contents`)
    scrapeCompletionService.updateThumbnail($container)
  }
}

module.exports = bind
