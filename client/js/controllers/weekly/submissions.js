'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus');
var moment = require('moment');
var series = require('contra/series');
var curry = require('contra/curry');
var debounce = require('lodash/debounce');
var ls = require('../../lib/storage');
var loadScript = require('../../lib/loadScript');
var scrapeCompletionService = require('../../services/scrapeCompletion');
var markdownService = require('../../../../services/markdown');
var textService = require('../../../../services/text');
var dateFormat = 'YYYY-MM-DD';

module.exports = controller;

function controller (...params) {
  series([
    curry(loadScript, '/js/rome.js'),
    curry(loadScript, '/js/weekly-compiler.js')
  ], loaded);
  function loaded () {
    ready(...params);
  }
}

function ready (viewModel, container, route) {
  var rome = global.rome;
  var weeklyCompilerService = global.weeklyCompiler;
  var subtypeInputs = $('.wu-type', container);
  var linkInput = $('.wu-link', container);
  var linkData = $('.wu-data', container);
  var linkImageContainer = $('.wa-link-image-container', linkData);
  var contactSection = $('.wu-contact', container);
  var sponsorSection = $('.wu-sponsor', container);
  var previewHtml = $('.wu-preview-link', container);
  var colored = $('.wu-colored', container);
  var updatePreviewSlowly = raf.bind(null, debounce(updatePreview, 100));
  var picker = $.findOne('.wu-sponsor-date-picker', container);
  var dates = $('.wu-dates', container);
  var submitButton = $('.wu-submit', container);
  var contactName = $('.wu-name', linkData);
  var contactEmail = $('.wu-email', linkData);
  var submissionNameStorageKey = 'submission.name';
  var submissionEmailStorageKey = 'submission.email';
  var editing = viewModel.editing;
  var blockDate;
  var romeOpts = {
    time: false,
    dateFormat: dateFormat,
    dateValidator: isValidSponsorDate,
    initialValue: nextThursday()
  };
  var calendar = rome(picker, romeOpts)
    .on('data', addDate)
    .on('back', calendarMoved)
    .on('next', calendarMoved);

  subtypeInputs
    .on('click', onTypeInputSelected)
    .on('click change', updatePreview);
  linkInput
    .on('change keypress keydown paste input', revealLinkDataAfterScraping);
  linkData
    .on('change keypress keydown paste input bureaucrat', '.wa-link-image', updateThumbnailImage)
    .on('change keypress keydown paste input', 'input,textarea,select', updatePreviewSlowly);
  dates
    .on('click', '.wu-sponsor-date-removal', removeDate);
  submitButton
    .on('click', submit);

  changeSubtype(subtypeInputs.where(':checked'));

  if (editing) {
    updatePreview();
  } else {
    contactName.value(ls.get(submissionNameStorageKey) || '');
    contactEmail.value(ls.get(submissionEmailStorageKey) || '');
    revealLinkDataAfterScraping();
  }

  function onTypeInputSelected (e) {
    var el = $(e.target);
    changeSubtype(el);
  }

  function changeSubtype (el) {
    var sponsor = isSponsor();
    var subtype = el.text();

    setClass(linkImageContainer, 'uv-hidden', subtype === 'secondary' || subtype === 'job');

    setClass(contactSection, 'wu-has-sponsor', sponsor);
    setClass(sponsorSection, 'uv-hidden', !sponsor);

    setClass(colored, 'wu-color-suggestion', subtype === 'suggestion');
    setClass(colored, 'wu-color-primary', subtype === 'primary');
    setClass(colored, 'wu-color-secondary', subtype === 'secondary');
    setClass(colored, 'wu-color-job', subtype === 'job');
  }

  function updateThumbnailImage (e) {
    var $container = $(e.target).parents('.wa-section-contents');
    scrapeCompletionService.updateThumbnail($container);
  }

  function revealLinkDataAfterScraping () {
    var url = linkInput.value();
    scrapeCompletionService.scrape({
      source: linkInput[0],
      url: url,
      container: linkData,
      updatePreview: updatePreview
    }, scraped);
    function scraped () {
      linkData.removeClass('uv-opaque');
    }
  }

  function getSelectedDates () {
    return $('.wu-sponsor-date', linkData).map(toDate);
    function toDate (el) {
      return $(el).attr('data-date');
    }
  }

  function nextThursday () {
    var now = moment();
    if (now.day() >= 4) {
      return now.day(11); // 7 + 4
    }
    return now.day(4);
  }

  function isValidSponsorDate (date) {
    var now = moment().endOf('day');
    var current = moment(date).startOf('day');
    var formatted = current.format(dateFormat);
    return current.isAfter(now) && current.day() === 4 && !getSelectedDates().some(alreadySelected);
    function alreadySelected (selectedDate) {
      return formatted === selectedDate;
    }
  }

  function calendarMoved () {
    blockDate = true;
  }

  function addDate (value) {
    setTimeout(untick, 10);
    function untick () {
      addDateSoon(value);
    }
  }

  function addDateSoon (value) {
    var selected = getSelectedDates();
    if (blockDate || selected.length >= 5) {
      blockDate = false;
      return;
    }
    var li = $('<li>');
    var description = $('<span>');
    var removal = $('<i>');
    var pretty = moment(value).format('MMMM Do');
    description.addClass('wu-sponsor-date-description');
    description.text(pretty);
    removal.addClass('fa fa-remove wu-sponsor-date-removal');
    li.addClass('wu-sponsor-date');
    li.attr('data-date', value);
    li.append(description);
    li.append(removal);
    dates.append(li);
    calendar.refresh();
    sortDates();
  }

  function sortDates () {
    getSelectedDates().sort(byDate).forEach(findAndPlaceLast);
    function byDate (left, right) {
      var ldate = moment(left, dateFormat);
      var rdate = moment(right, dateFormat);
      return ldate.isBefore(rdate) ? -1 : 1;
    }
    function findAndPlaceLast (date) {
      var selector = '.wu-sponsor-date[data-date="' + date + '"]';
      $(selector).appendTo(dates);
    }
  }

  function removeDate (e) {
    $(e.target).parents('.wu-sponsor-date').remove();
    calendar.refresh();
  }

  function getSubtype () {
    return subtypeInputs.where(':checked').text();
  }

  function isSponsor () {
    var subtype = getSubtype();
    var sponsor = subtype && subtype !== 'suggestion';
    return sponsor;
  }

  function getModel () {
    var subtype = getSubtype();
    var sponsor = isSponsor();
    var model = {
      submitter: {
        name: contactName.value(),
        email: contactEmail.value(),
        comment: $('.wu-comment', linkData).value()
      },
      section: {
        type: 'link',
        subtype: subtype || null,
        title: $('.wa-link-title', linkData).value(),
        href: linkInput.value(),
        foreground: '#1bc211',
        background: 'transparent',
        source: $('.wa-link-source', linkData).value(),
        sourceHref: $('.wa-link-source-href', linkData).value(),
        image: linkImageContainer.but('.uv-hidden').find('.wa-link-image').value(),
        sponsored: sponsor && subtype !== 'job',
        tags: [],
        description: $('.wa-link-description', linkData).value()
      }
    };
    if (sponsor) {
      model.sponsor = {
        amount: parseInt($('.wu-sponsor-amount-input', linkData).value() || '0'),
        invoice: $('.wu-sponsor-invoice-input').value(),
        dates: getSelectedDates()
      };
    }
    return model;
  }

  function updatePreview () {
    var model = getModel();
    var options = {
      markdown: markdownService,
      slug: 'submission-preview'
    };
    weeklyCompilerService.compile([model.section], options, compiled);
    function compiled (err, html) {
      if (err) {
        html = textService.format('<pre class="wa-error">%s</pre>', err);
      }
      previewHtml.html(html);
    }
  }

  function submit () {
    var endpoint = '/api/weeklies/submissions';
    var model = getModel();
    var data = { json: model };
    if (editing) {
      endpoint += '/' + route.params.slug;
    }
    if (route.query.verify) {
      endpoint += '?verify=' + route.query.verify;
    }
    viewModel.measly.post(endpoint, data).on('data', submitted);
    function submitted () {
      var owner = viewModel.roles && viewModel.roles.owner;
      var target = owner ? '/weekly/submissions/review' : '/weekly';
      ls.set(submissionNameStorageKey, model.submitter.name);
      ls.set(submissionEmailStorageKey, model.submitter.email);
      taunus.navigate(target);
    }
  }
}

function setClass (el, className, condition) {
  if (condition) {
    el.addClass(className);
  } else {
    el.removeClass(className);
  }
}
