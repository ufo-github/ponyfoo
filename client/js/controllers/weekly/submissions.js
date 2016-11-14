'use strict'

const $ = require(`dominus`)
const raf = require(`raf`)
const taunus = require(`taunus`)
const moment = require(`moment`)
const series = require(`contra/series`)
const curry = require(`contra/curry`)
const debounce = require(`lodash/debounce`)
const ls = require(`local-storage`)
const loadScript = require(`../../lib/loadScript`)
const scrapeCompletionService = require(`../../services/scrapeCompletion`)
const weeklySubmissionPreviewService = require(`../../services/weeklySubmissionPreview`)
const dateFormat = `YYYY-MM-DD`

module.exports = controller

function controller (...params) {
  series([
    curry(loadScript, `/js/rome.js`),
    curry(loadScript, `/js/weekly-compiler.js`)
  ], loaded)
  function loaded () {
    ready(...params)
  }
}

function ready (viewModel, container, route) {
  const subtypeInputs = $(`.wu-type`, container)
  const linkInput = $(`.wu-link`, container)
  const linkData = $(`.wu-data`, container)
  const linkImageContainer = $(`.wa-link-image-container`, linkData)
  const contactSection = $(`.wu-contact`, container)
  const sponsorSection = $(`.wu-sponsor`, container)
  const previewHtml = $(`.wu-preview-link`, container)
  const colored = $(`.wu-colored`, container)
  const picker = $.findOne(`.wu-sponsor-date-picker`, container)
  const dates = $(`.wu-dates`, container)
  const submitButton = $(`.wu-submit`, container)
  const contactName = $(`.wu-name`, linkData)
  const contactEmail = $(`.wu-email`, linkData)
  const submissionNameStorageKey = `submission.name`
  const submissionEmailStorageKey = `submission.email`
  const editing = viewModel.editing

  const rome = global.rome
  const weeklyCompilerService = global.weeklyCompiler

  const updatePreview = weeklySubmissionPreviewService.getUpdatePreview(previewHtml, {
    weeklyCompilerService,
    inputContainer: linkData,
    getSectionModelInfo
  })
  const updatePreviewSlowly = raf.bind(null, debounce(updatePreview, 100))

  let blockDate
  const romeOpts = {
    time: false,
    dateFormat,
    dateValidator: isValidSponsorDate,
    initialValue: nextThursday()
  }
  const calendar = rome(picker, romeOpts)
    .on(`data`, addDate)
    .on(`back`, calendarMoved)
    .on(`next`, calendarMoved)

  subtypeInputs
    .on(`click`, onTypeInputSelected)
    .on(`click change`, updatePreview)
  linkInput
    .on(`change keypress keydown paste input`, revealLinkDataAfterScraping)
  linkData
    .on(`change keypress keydown paste input bureaucrat`, `.wa-link-image`, updateThumbnailImage)
    .on(`change keypress keydown paste input`, `input,textarea,select`, updatePreviewSlowly)
  dates
    .on(`click`, `.wu-sponsor-date-removal`, removeDate)
  submitButton
    .on(`click`, submit)

  changeSubtype(subtypeInputs.where(`:checked`))

  if (editing) {
    updatePreview()
  } else {
    contactName.value(ls.get(submissionNameStorageKey) || ``)
    contactEmail.value(ls.get(submissionEmailStorageKey) || ``)
    revealLinkDataAfterScraping()
  }

  function onTypeInputSelected (e) {
    const el = $(e.target)
    changeSubtype(el)
  }

  function changeSubtype (el) {
    const sponsor = isSponsor()
    const subtype = el.text()

    setClass(linkImageContainer, `uv-hidden`, subtype === `secondary` || subtype === `job`)

    setClass(contactSection, `wu-has-sponsor`, sponsor)
    setClass(sponsorSection, `uv-hidden`, !sponsor)

    setClass(colored, `wu-color-suggestion`, subtype === `suggestion`)
    setClass(colored, `wu-color-primary`, subtype === `primary`)
    setClass(colored, `wu-color-secondary`, subtype === `secondary`)
    setClass(colored, `wu-color-job`, subtype === `job`)
  }

  function updateThumbnailImage (e) {
    const $container = $(e.target).parents(`.wa-section-contents`)
    scrapeCompletionService.updateThumbnail($container)
  }

  function revealLinkDataAfterScraping () {
    scrapeCompletionService.scrape({
      source: linkInput[0],
      container: linkData,
      updatePreview
    }, scraped)
    function scraped () {
      linkData.removeClass(`uv-opaque`)
    }
  }

  function getSelectedDates () {
    return $(`.wu-sponsor-date`, linkData).map(toDate)
    function toDate (el) {
      return $(el).attr(`data-date`)
    }
  }

  function nextThursday () {
    const now = moment()
    if (now.day() >= 4) {
      return now.day(11) // 7 + 4
    }
    return now.day(4)
  }

  function isValidSponsorDate (date) {
    const now = moment().endOf(`day`)
    const current = moment(date).startOf(`day`)
    const formatted = current.format(dateFormat)
    return current.isAfter(now) && current.day() === 4 && !getSelectedDates().some(alreadySelected)
    function alreadySelected (selectedDate) {
      return formatted === selectedDate
    }
  }

  function calendarMoved () {
    blockDate = true
  }

  function addDate (value) {
    setTimeout(untick, 10)
    function untick () {
      addDateSoon(value)
    }
  }

  function addDateSoon (value) {
    const selected = getSelectedDates()
    if (blockDate || selected.length >= 5) {
      blockDate = false
      return
    }
    const li = $(`<li>`)
    const description = $(`<span>`)
    const removal = $(`<i>`)
    const pretty = moment(value).format(`MMMM Do`)
    description.addClass(`wu-sponsor-date-description`)
    description.text(pretty)
    removal.addClass(`fa fa-remove wu-sponsor-date-removal`)
    li.addClass(`wu-sponsor-date`)
    li.attr(`data-date`, value)
    li.append(description)
    li.append(removal)
    dates.append(li)
    calendar.refresh()
    sortDates()
  }

  function sortDates () {
    getSelectedDates().sort(byDate).forEach(findAndPlaceLast)
    function byDate (left, right) {
      const ldate = moment(left, dateFormat)
      const rdate = moment(right, dateFormat)
      return ldate.isBefore(rdate) ? -1 : 1
    }
    function findAndPlaceLast (date) {
      const selector = `.wu-sponsor-date[data-date="` + date + `"]`
      $(selector).appendTo(dates)
    }
  }

  function removeDate (e) {
    $(e.target).parents(`.wu-sponsor-date`).remove()
    calendar.refresh()
  }

  function getSubtype () {
    return subtypeInputs.where(`:checked`).text()
  }

  function isSponsor () {
    const subtype = getSubtype()
    const sponsor = subtype && subtype !== `suggestion`
    return sponsor
  }

  function getSectionModelInfo () {
    const subtype = getSubtype()
    const sponsor = isSponsor()
    return {
      subtype: subtype || null,
      href: linkInput.value(),
      sponsored: sponsor && subtype !== `job`
    }
  }

  function getModel () {
    const sponsor = isSponsor()
    const section = weeklySubmissionPreviewService.getSectionModel(linkData, getSectionModelInfo())
    const model = {
      submitter: {
        name: contactName.value(),
        email: contactEmail.value(),
        comment: $(`.wu-comment`, linkData).value()
      },
      section
    }
    if (sponsor) {
      model.sponsor = {
        amount: parseInt($(`.wu-sponsor-amount-input`, linkData).value() || `0`),
        invoice: $(`.wu-sponsor-invoice-input`).value(),
        dates: getSelectedDates()
      }
    }
    return model
  }

  function submit () {
    const model = getModel()
    const data = { json: model }
    const endpoint = getEndpoint()
    viewModel.measly.post(endpoint, data).on(`data`, submitted)

    function submitted () {
      const owner = viewModel.roles && viewModel.roles.owner
      const target = owner ? `/weekly/submissions/review` : `/weekly`
      if (!editing) {
        ls.set(submissionNameStorageKey, model.submitter.name)
        ls.set(submissionEmailStorageKey, model.submitter.email)
      }
      taunus.navigate(target)
    }

    function getEndpoint () {
      const base = `/api/weeklies/submissions`
      if (editing) {
        return `${base}/${route.params.slug}`
      }
      if (route.query.verify) {
        return `${base}?verify=${route.query.verify}`
      }
      return base
    }
  }
}

function setClass (el, className, condition) {
  if (condition) {
    el.addClass(className)
  } else {
    el.removeClass(className)
  }
}
