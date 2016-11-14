'use strict'

const $ = require(`dominus`)
const taunus = require(`taunus`)
const woofmark = require(`woofmark`)
const markdownService = require(`../../../services/markdown`)

function textareas () {
  taunus.gradual.transform(before)
  taunus.on(`render`, activate)
}

function activate (container) {
  $(`.wk-textarea`, container).forEach(convert)

  function convert (el) {
    const wel = $(el)
    const hasHtml = wel.hasClass(`wk-html`)
    const hasWysiwyg = wel.hasClass(`wk-wysiwyg`)
    const editor = woofmark(el, {
      parseMarkdown: markdownService.compile,
      classes: {
        wysiwyg: `md-markdown`,
        prompts: {
          dropicon: `fa fa-upload`
        },
        dropicon: `fa fa-upload`
      },
      render: {
        modes: renderModes,
        commands: renderCommands
      },
      images: {
        url: `/api/images`,
        restriction: `GIF, JPG, and PNG images`
      },
      html: hasHtml,
      wysiwyg: hasWysiwyg
    })

    taunus.track(el, editor)

    function renderModes (el, id) {
      const icons = {
        markdown: `file-text-o`,
        html: `file-code-o`,
        wysiwyg: `eye`
      }
      renderIcon(el, icons[id] || id)
    }

    function renderCommands (el, id) {
      const icons = {
        quote: `quote-right`,
        ul: `list-ul`,
        ol: `list-ol`,
        heading: `header`,
        image: `picture-o`,
        attachment: `paperclip`
      }
      renderIcon(el, icons[id] || id)
    }

    function renderIcon (el, icon) {
      $(el).addClass(`wk-command-${ icon }`)
      $(`<i>`).addClass(`fa fa-${ icon }`).appendTo(el)
    }
  }
}

function before (form) {
  const areas = $(`textarea`, form)
  const store = []

  areas.forEach(replace)
  return after

  function replace (el) {
    const input = $(el)
    store.push(input.value())
    input.value(woofmark(el).value())
  }
  function after () {
    areas.forEach(restore)
  }
  function restore (el, i) {
    $(el).value(store[i])
  }
}

module.exports = textareas
textareas.activate = activate
