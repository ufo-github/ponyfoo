'use strict'

const $ = require(`dominus`)
const raf = require(`raf`)
const series = require(`contra/series`)
const curry = require(`contra/curry`)
const sluggish = require(`sluggish`)
const dragula = require(`dragula`)
const taunus = require(`taunus`)
const debounce = require(`lodash/debounce`)
const scrapeCompletionService = require(`../../../services/scrapeCompletion`)
const markdownService = require(`../../../../../services/markdown`)
const textService = require(`../../../../../services/text`)
const summaryService = require(`../../../../../services/summary`)
const loadScript = require(`../../../lib/loadScript`)
const rstrip = /^\s*<p>\s*<\/p>\s*$/i
const rdigits = /^\d+$/

module.exports = controller

function controller (...params) {
  series([
    curry(loadScript, `/js/stylus.js`),
    curry(loadScript, `/js/weekly-compiler.js`)
  ], () => ready(...params))
}

function ready (viewModel, container, route) {
  const weeklyCompilerService = global.weeklyCompiler
  const weeklyIssue = viewModel.issue
  const editing = viewModel.editing
  const released = editing && weeklyIssue.status === `released`
  const editor = $.findOne(`.wa-editor`, container)
  const toolbox = $.findOne(`.wa-toolbox`, container)
  const submissions = $.findOne(`.wa-submissions`, container)
  const tools = $(`.wa-tool`, toolbox)
  const title = $(`.wa-title`)
  const slug = $(`.wa-slug`)
  const status = $(`.wa-status`)
  const summaryEditor = $.findOne(`.wa-summary-editor`, container)
  const summary = $(`.wa-summary`)
  const email = $(`#wa-campaign-email`)
  const tweet = $(`#wa-campaign-tweet`)
  const fb = $(`#wa-campaign-fb`)
  const echojs = $(`#wa-campaign-echojs`)
  const hn = $(`#wa-campaign-hn`)
  const toggleSectionsButton = $(`.wa-toggle-sections`)
  const discardButton = $(`.wa-discard`)
  const saveButton = $(`.wa-save`)
  const preview = $(`.wa-preview`)
  const previewHtml = $(`.wy-content`, preview)
  const drakeTools = dragula([editor, toolbox], {
    moves: toolMoves,
    copy: true
  })
  const drakeSubmissions = dragula([editor, submissions], {
    moves: submissionMoves,
    copy: true
  })
  const drakeSort = dragula([editor], {
    moves: editorSectionMoves
  })
  const updatePreviewSlowly = raf.bind(null, debounce(updatePreview, 100))
  const scrapeLinkSlowly = debounce(scrapeLink, 500)
  let scraping = true

  $(document.documentElement).on(`keyup`, cancellations)

  $(editor)
    .on(`click`, `.wa-section-remove`, removeSection)
    .on(`click`, `.wa-section-toggle`, toggleSection)
    .on(`click`, `.wa-section-clone`, cloneSection)
    .on(`change`, `.wa-color-picker`, pickedColor)
    .on(`change`, `.wa-link-subtype`, pickedSubtype)
    .on(`change`, `.wa-header-background`, updateLinkColors)
    .on(`change keypress keydown paste input bureaucrat`, `.wa-link-image`, updateThumbnailImage)
    .on(`change keypress keydown paste input`, `.wa-link-href`, function (e) {
      scrapeLinkSlowly(e.target)
    })
    .on(`click`, `.wa-link-toggle-tags`, toggleTags)
    .and(summaryEditor)
      .on(`change keypress keydown paste input`, `input,textarea,select`, updatePreviewSlowly)

  drakeTools
    .on(`cloned`, clonedTool)
    .on(`drop`, droppedTool)

  drakeSubmissions
    .on(`cloned`, clonedTool)
    .on(`drop`, droppedSubmission)

  drakeSort.on(`drop`, updatePreviewSlowly)

  status.on(`change`, updatePublication)
  tools.on(`click`, pickedTool)
  discardButton.on(`click`, discard)
  saveButton.on(`click`, save)
  toggleSectionsButton.on(`click`, toggleSections)
  $(`.wa-scraper`).on(`click`, toggleScraping)
  updatePublication()
  updatePreview()

  function toggleSections () {
    const sections = $(`.wa-section`, editor).but(`[data-tool="header"]`)
    const contents = sections.find(`.wa-section-contents`)
    const hidden = contents.where(`.uv-hidden`)
    if (hidden.length === contents.length) {
      contents.removeClass(`uv-hidden`)
    } else {
      contents.addClass(`uv-hidden`)
    }
  }

  function updatePublication () {
    if (released) {
      saveButton.text(`Save Changes`)
      saveButton.parent().attr(`aria-label`, `Make your modifications immediately accessible!`)
      discardButton.text(`Delete Issue`)
      discardButton.attr(`aria-label`, `Permanently delete this weekly issue`)
      return
    }
    const state = status.where(`:checked`).text()
    if (state === `draft`) {
      saveButton.text(`Save Draft`)
      saveButton.parent().attr(`aria-label`, `You can access your drafts at any time`)
      return
    }
    if (state === `ready`) {
      saveButton.text(`Save & Mark Ready`)
      saveButton.parent().attr(`aria-label`, `Schedule this weekly issue for publication next thursday!`)
    }
  }

  function updatePreview () {
    const model = getModel()
    const slug = rdigits.test(model.slug) ? `issue-` + model.slug : model.slug
    const options = {
      markdown: markdownService,
      slug: slug
    }
    weeklyCompilerService.compile(model.sections, options, compiled)
    function compiled (err, html) {
      if (err) {
        html = textService.format(`<pre class="wa-error">%s</pre>`, err)
      }
      previewHtml.html(html)
      const previewSummary = $(`.wy-section-summary`, preview)
      const summaryHtml = markdownService.compile(summary.value())
      previewSummary.html(summaryHtml)
      updateLinkSections()
    }
  }

  function updateLinkSections () {
    $(`.wa-section`).where(`[data-tool="link"]`).forEach(function (el) {
      const $linkHeading = $(`.wa-section-heading`, el)
      const $linkPreview = $(`.wa-link-preview`, el)
      const $title = $(`.wa-link-title`, el)
      const title = markdownService.compile($title.value()).replace(rstrip, ``)
      const summaryLong = summaryService.summarize(title)
      const summaryShort = summaryService.summarize(title, 30)
      const summaryHtml = summaryShort.html.trim()
      const postfix = summaryHtml ? ` – ` + summaryHtml : ``

      $linkPreview.html(postfix)

      const summaryLabelText = summaryLong.text.trim()
      const summaryTitleText = summaryShort.text.trim()
      if (summaryTitleText.length >= summaryLabelText.length) {
        $linkHeading.attr(`aria-label`, null)
      } else {
        $linkHeading.attr(`aria-label`, summaryLabelText)
      }
    })
  }

  function updateLinkColors (e) {
    const $el = $(e.target)
    const $header = $el.parents(`.wa-section`)
    const color = $el.value()
    let $link = $header

    do {
      $link = $link.next(`[data-tool="link"]`)
      $link.find(`.wa-link-foreground`).value(color)
    } while ($link.length)

    updatePreview()
  }

  function toolMoves (el, source) {
    return source === toolbox
  }
  function submissionMoves (el, source) {
    return source === submissions
  }
  function editorSectionMoves (el, source, handle) {
    const $handle = $(handle)
    return (
      $handle.hasClass(`wa-section-header`) ||
      $handle.hasClass(`wa-section-heading`) ||
      $handle.parents(`.wa-section-heading`).length > 0
    )
  }
  function removeSection (e) {
    $(e.target).parents(`.wa-section`).remove()
    updatePreviewSlowly()
  }
  function toggleSection (e) {
    const toggler = $(e.target)
    const content = toggler.parents(`.wa-section`).find(`.wa-section-contents`)
    toggleUsingButton(content, toggler, [`fa-compress`, `fa-expand`])
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
  function clonedTool (clone) {
    $(clone).addClass(`wa-section-header`)
  }
  function cancellations (e) {
    if (e.which === 27) {
      drakeTools.cancel(true)
      drakeSubmissions.cancel(true)
      drakeSort.cancel(true)
    }
  }
  function pickedColor (e) {
    const select = $(e.target)
    const color = select.value()
    select
      .parents(`.wa-color-picker`)
      .find(select.attr(`data-target`))
      .css(`color`, color)
  }
  function pickedSubtype (e) {
    const select = $(e.target)
    const subtype = select.value()
    select
      .parents(`.wa-section`)
      .find(`.wa-section-header`)
      .removeClass(`wa-link-header-original`)
      .removeClass(`wa-link-header-suggestion`)
      .removeClass(`wa-link-header-primary`)
      .removeClass(`wa-link-header-secondary`)
      .removeClass(`wa-link-header-job`)
      .addClass(`wa-link-header-` + subtype)
  }
  function droppedSubmission (el, target) {
    if (target !== editor) {
      return
    }
    const tool = $(el)
    const toolId = tool.attr(`data-id`)
    const action = `author/weeklies/tool-link`
    const section = findSubmissionSectionById(toolId)
    if (!section) {
      return
    }
    insertingPartial(taunus.partial.replace(el, action, {
      knownTags: viewModel.knownTags,
      section: section
    }))
  }
  function findSubmissionSectionById (id) {
    const submissions = viewModel.submissions
    for (let i = 0; i < submissions.length; i++) {
      if (submissions[i].id === id) {
        return submissions[i].section
      }
    }
  }
  function droppedTool (el, target) {
    if (target !== editor) {
      return
    }
    addSectionWithTool(el)
  }
  function pickedTool (e) {
    addSectionWithTool(e.target, true)
    e.preventDefault()
    e.stopPropagation()
  }
  function addSectionWithTool (el, append) {
    const tool = $(el)
    const toolName = tool.parents(`.wa-tool`).and(tool).attr(`data-tool`)
    const action = `author/weeklies/tool-` + toolName
    const model = {
      knownTags: viewModel.knownTags,
      section: getDefaultSectionModel(toolName)
    }
    let insertion
    if (append) {
      insertion = taunus.partial.appendTo(editor, action, model)
    } else {
      insertion = taunus.partial.replace(el, action, model)
    }
    insertingPartial(insertion)
  }
  function getDefaultSectionModel (toolName) {
    if (toolName === `link`) {
      return {
        sourceHref: `https://twitter.com/`
      }
    }
    return {}
  }
  function cloneSection (e) {
    const section = $(e.target).parents(`.wa-section`)
    const toolName = section.attr(`data-tool`)
    const action = `author/weeklies/tool-` + toolName
    const model = getSectionModel(section)
    insertingPartial(taunus.partial.afterOf(section[0], action, {
      knownTags: viewModel.knownTags,
      section: model
    }))
  }
  function insertingPartial (partial) {
    partial
      .on(`render`, displayDetails)
      .on(`render`, updatePreviewSlowly)
    function displayDetails (html, container) {
      displayLinkDetails(container)
    }
  }
  function displayLinkDetails (container) {
    $(`.wa-section-contents`, container).removeClass(`uv-hidden`)
  }
  function getSectionModel (section) {
    const mappers = {
      header: getHeaderSectionModel,
      markdown: getMarkdownSectionModel,
      link: getLinkSectionModel,
      styles: getStylesSectionModel
    }
    const type = $(section).attr(`data-tool`)
    return mappers[type](section)
  }
  function getHeaderSectionModel (section) {
    return {
      type: `header`,
      size: parseInt($(`.wa-header-size`, section).value(), 10),
      text: $(`.wa-header-text`, section).value(),
      foreground: $(`.wa-header-foreground`, section).value(),
      background: $(`.wa-header-background`, section).value()
    }
  }
  function getMarkdownSectionModel (section) {
    return {
      type: `markdown`,
      text: $(`.wa-markdown-text`, section).value()
    }
  }
  function getLinkSectionModel (section) {
    const unknownTags = textService.splitTags($(`.wa-link-tags`, section).value())
    const knownTags = $(`.wa-link-tag`, section).filter(byChecked).map(toValue).filter(unique)
    return {
      type: `link`,
      subtype: $(`.wa-link-subtype`, section).value() || `original`,
      title: $(`.wa-link-title`, section).value(),
      href: $(`.wa-link-href`, section).value(),
      foreground: $(`.wa-link-foreground`, section).value(),
      background: $(`.wa-link-background`, section).value(),
      source: $(`.wa-link-source`, section).value(),
      sourceHref: $(`.wa-link-source-href`, section).value(),
      image: $(`.wa-link-image`, section).value(),
      sponsored: $(`.wa-link-sponsored`, section).value(),
      tags: unknownTags.concat(knownTags),
      description: $(`.wa-link-description`, section).value()
    }
    function byChecked (el) {
      return $(el).value()
    }
    function toValue (el) {
      return $(el).text()
    }
    function unique (tag) {
      return unknownTags.indexOf(tag) === -1
    }
  }
  function getStylesSectionModel (section) {
    return {
      type: `styles`,
      styles: $(`.wa-styles-text`, section).value()
    }
  }
  function getModel () {
    const state = released ? weeklyIssue.status : status.where(`:checked`).text()
    const data = {
      title: title.value(),
      slug: sluggish(slug.value()),
      sections: $(`.wa-section`, editor).map(getSectionModel),
      status: state,
      summary: summary.value(),
      email: email.value(),
      tweet: tweet.value(),
      fb: fb.value(),
      echojs: echojs.value(),
      hn: hn.value()
    }
    return data
  }

  function toggleScraping (e) {
    scraping = !scraping
    if (scraping) {
      $(e.target).removeClass(`wa-toggler-off`)
    } else {
      $(e.target).addClass(`wa-toggler-off`)
    }
  }

  function updateThumbnailImage (e) {
    const $container = $(e.target).parents(`.wa-section-contents`)
    scrapeCompletionService.updateThumbnail($container)
  }

  function scrapeLink (el) {
    if (scraping === false) {
      return
    }
    const $el = $(el)
    scrapeCompletionService.scrape({
      source: el,
      container: $el.parents(`.wa-section-contents`),
      updatePreview: updatePreview
    })
  }

  function save () {
    send({ json: getModel() })
  }

  function send (data) {
    let req

    if (editing) {
      req = viewModel.measly.patch(`/api/weeklies/` + route.params.slug, data)
    } else {
      req = viewModel.measly.put(`/api/weeklies`, data)
    }
    req.on(`data`, leave)
  }

  function discard () {
    const name = route.params.slug ? `/weeklies/` + route.params.slug : `draft`
    const confirmation = confirm(`About to discard ` + name + `, are you sure?`)
    if (!confirmation) {
      return
    }
    if (editing) {
      viewModel.measly.delete(`/api/weeklies/` + route.params.slug).on(`data`, leave)
    } else {
      leave()
    }
  }

  function leave () {
    taunus.navigate(`/weekly/review`)
  }
}
