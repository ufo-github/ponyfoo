'use strict';

var $ = require('dominus');
var throttle = require('../../lib/throttle');
var megamark = require('megamark');
var moment = require('moment');
var raf = require('raf');
var taunus = require('taunus/global');
var textService = require('../../../../services/text');
var storage = require('../../lib/storage');
var defaultKey = 'author-unsaved-draft';
var publicationFormat = 'DD-MM-YYYY HH:mm';

function noop () {}

module.exports = function (viewModel, container, route) {
  var article = viewModel.article;
  var editing = viewModel.editing;
  var published = editing && article.status === 'published';
  var title = $('.ac-title');
  var slug = $('.ac-slug');
  var texts = $('.ac-text');
  var teaser = $('.ac-teaser');
  var introduction = $('.ac-introduction');
  var body = $('.ac-body');
  var tags = $('.ac-tags');
  var campaign = $('.ac-campaign');
  var email = $('#ac-campaign-email');
  var tweet = $('#ac-campaign-tweet');
  var echojs = $('#ac-campaign-echojs');
  var hn = $('#ac-campaign-hn');
  var lobsters = $('#ac-campaign-lobsters');
  var schedule = $('.ac-schedule');
  var publication = $('.ac-publication');
  var preview = $.findOne('.ac-preview');
  var previewTitle = $('.ac-preview-title');
  var previewTags = $.findOne('.ac-preview-tags');
  var previewHtml = $('.ac-preview-html');
  var discardButton = $('.ac-discard');
  var saveButton = $('.ac-save');
  var status = $('.ac-status');
  var statusRadio = {
    draft: $('#ac-draft-radio'),
    publish: $('#ac-publish-radio')
  };
  var boundSlug = true;
  var serializeSlowly = editing ? noop : throttle(serialize, 200);
  var previews = $('.pmk-preview', preview);

  previews.i(0).addClass('at-teaser');
  previews.i(1).addClass('at-introduction');
  previews.i(2).addClass('at-body');
  title.on('keypress keydown paste', raf.bind(null, typingTitle));
  slug.on('keypress keydown paste', typingSlug);
  texts.on('keypress keydown paste', raf.bind(null, typingText));
  tags.on('keypress keydown paste', raf.bind(null, typingTags));
  discardButton.on('click', discard);
  saveButton.on('click', save);
  status.on('change', updatePublication);
  campaign.on('change', '.ck-input', serializeSlowly);
  schedule.on('change', updatePublication);

  deserialize(editing && article);

  function updatePublication () {
    serializeSlowly();

    if (published) {
      saveButton.find('.bt-text').text('Save Changes');
      saveButton.parent().attr('aria-label', 'Make your modifications immediately accessible!');
      discardButton.text('Delete Article');
      discardButton.attr('aria-label', 'Permanently delete this article');
      return;
    }
    var state = status.where(':checked').text();
    if (state === 'draft') {
      saveButton.find('.bt-text').text('Save Draft');
      saveButton.parent().attr('aria-label', 'You can access your drafts at any time');
      return;
    }
    var scheduled = schedule.value();
    if (scheduled) {
      saveButton.find('.bt-text').text('Schedule');
      saveButton.parent().attr('aria-label', 'Schedule this article for publication');
      return;
    }
    if (state === 'publish') {
      saveButton.find('.bt-text').text('Publish');
      saveButton.parent().attr('aria-label', 'Make the content immediately accessible!');
    }
  }

  function typingText () {
    serializeSlowly();
    updatePreviewMarkdown();
  }

  function typingTitle () {
    if (boundSlug) {
      updateSlug();
    }
    updatePreviewTitle();
    serializeSlowly();
  }

  function typingSlug () {
    boundSlug = false;
    serializeSlowly();
  }

  function updateSlug () {
    slug.value(textService.slug(title.value()));
  }

  function updatePreviewTitle () {
    previewTitle.text(title.value());
  }

  function typingTags () {
    serializeSlowly();
  }

  function updatePreviewMarkdown () {
    $('.ac-preview-teaser').html(getHtml(teaser));
    $('.ac-preview-introduction').html(getHtml(introduction));
    $('.ac-preview-body').html(getHtml(body));

    function getHtml (el) {
      return megamark(el.value());
    }
  }

  function serialize () { storage.set(defaultKey, getRequestData()); }
  function clear () { storage.remove(defaultKey); }

  function deserialize (source) {
    var data = source || storage.get(defaultKey) || {
      email: true, tweet: true, echojs: true, hn: true, lobsters: true
    };
    var titleText = data.title || '';
    var slugText = data.slug || '';

    title.value(titleText);
    slug.value(slugText);
    teaser.value(data.teaser || '');
    introduction.value(data.introduction || '');
    body.value(data.body || '');
    tags.value((data.tags || []).join(' '));
    email.value(data.email);
    tweet.value(data.tweet);
    echojs.value(data.echojs);
    hn.value(data.hn);
    lobsters.value(data.lobsters);

    boundSlug = textService.slug(titleText) === slugText;

    if (data.status !== 'published') {
      statusRadio[data.status || 'publish'].value(true);

      if ('publication' in data) {
        schedule.value(true);
      }
    }

    updatePreviewTitle();
    updatePreviewMarkdown();
    updatePublication();
  }

  function getRequestData () {
    var individualTags = textService.splitTags(tags.value());
    var state = published ? article.status : status.where(':checked').text();
    var data = {
      title: title.value(),
      slug: slug.value(),
      teaser: teaser.value(),
      introduction: introduction.value(),
      body: body.value(),
      tags: individualTags,
      status: state,
      email: email.value(),
      tweet: tweet.value(),
      echojs: echojs.value(),
      hn: hn.value(),
      lobsters: lobsters.value()
    };
    var scheduled = schedule.value();
    if (scheduled && !published) {
      data.publication = moment(publication.value(), publicationFormat).format();
    }
    return data;
  }

  function save () {
    var data = getRequestData();
    send({ json: data });
  }

  function send (data) {
    var req;

    if (editing) {
      req = viewModel.measly.patch('/api/articles/' + route.params.slug, data);
    } else {
      req = viewModel.measly.put('/api/articles', data);
    }
    req.on('data', leave);
  }

  function discard () {
    var confirmation = confirm('About to discard /articles/' + route.params.slug + ', are you sure?');
    if (!confirmation) {
      return;
    }
    if (editing) {
      viewModel.measly.delete('/api/articles/' + route.params.slug).on('data', leave);
    } else {
      leave();
    }
  }

  function leave () {
    clear();
    taunus.navigate('/author/review');
  }
};
