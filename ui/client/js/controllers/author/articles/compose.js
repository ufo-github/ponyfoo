'use strict';

const $ = require(`dominus`);
const estimate = require(`estimate`);
const debounce = require(`lodash/debounce`);
const concurrent = require(`contra/concurrent`);
const moment = require(`moment`);
const sluggish = require(`sluggish`);
const raf = require(`raf`);
const taunus = require(`taunus`);
const articleSummarizationService = require(`../../../../../services/articleSummarization`);
const markdownService = require(`../../../../../services/markdown`);
const datetimeService = require(`../../../../../services/datetime`);
const twitterService = require(`../../../conventions/twitter`);
const storage = require(`../../../lib/storage`);
const loadScript = require(`../../../lib/loadScript`);
const defaultStorageKey = `author-unsaved-draft`;
const publicationFormat = `DD-MM-YYYY HH:mm`;
const maxTagSuggestions = 8;

function noop () {}

module.exports = controller;

function controller (viewModel, container, route) {
  concurrent([
    loadScriptUrl(`/js/horsey.js`),
    loadScriptUrl(`/js/insignia.js`),
    loadScriptUrl(`/js/rome.js`)
  ], loaded);

  function loaded () {
    initialize(viewModel, container, route);
  }

  function loadScriptUrl (url) {
    return scriptLoader;
    function scriptLoader (next) {
      loadScript(url, next);
    }
  }
}

function initialize (viewModel, container, route) {
  const horsey = global.horsey;
  const insignia = global.insignia;
  const rome = global.rome;
  const { owner } = viewModel.roles;
  const article = viewModel.article;
  const editing = viewModel.editing;
  const published = editing && article.status === `published`;
  const title = $(`.ac-title`);
  const slug = $(`.ac-slug`);
  const texts = $(`.ac-text`);
  const heroImage = $(`.ac-hero-image`);
  const teaser = $(`.ac-teaser`);
  const editorNote = $(`.ac-editor-note`);
  const introduction = $(`.ac-introduction`);
  const body = $(`.ac-body`);
  const summary = $(`.ac-summary`);
  const author = $(`.ac-author`);
  const authorContainer = $.findOne(`.ac-author-container`);
  const tags = $(`.ac-tags`);
  const tagsContainer = $.findOne(`.ac-tags-container`);
  const campaign = $(`.ac-campaign`);
  const email = $(`#ac-campaign-email`);
  const tweet = $(`#ac-campaign-tweet`);
  const fb = $(`#ac-campaign-fb`);
  const echojs = $(`#ac-campaign-echojs`);
  const hn = $(`#ac-campaign-hn`);
  const schedule = $(`.ac-schedule`);
  const publication = $(`.ac-publication`);
  const preview = $(`.ac-preview`);
  const previewHeader = $(`.at-header`, preview);
  const previewTitle = $(`.ac-preview-title`);
  const previewTeaser = $(`.ac-preview-teaser`);
  const previewEditorNote = $(`.ac-preview-editor-note`);
  const previewIntroduction = $(`.ac-preview-introduction`);
  const previewBody = $(`.ac-preview-body`);
  const previewSummary = $.findOne(`.ac-preview-summary`);
  const discardButton = $(`.ac-discard`);
  const saveButton = $(`.ac-save`);
  const status = $(`.ac-status`);
  const statusRadio = {
    draft: $(`#ac-draft-radio`),
    publish: $(`#ac-publish-radio`)
  };
  const serializeSlowly = editing ? noop : debounce(serialize, 200);
  const typingTitleSlowly = raf.bind(null, debounce(typingTitle, 100));
  const typingSlugSlowly = raf.bind(null, debounce(typingSlug, 100));
  const typingHeroImageSlowly = raf.bind(null, debounce(typingHeroImage, 100));
  const typingTextSlowly = raf.bind(null, debounce(typingText, 100));
  const typingSummarySlowly = raf.bind(null, debounce(typingSummary, 100));
  const typingTagsSlowly = raf.bind(null, debounce(typingTags, 100));
  const updatePreviewMarkdownSlowly = raf.bind(null, debounce(updatePreviewMarkdown, 300));
  const updatePreviewSummarySlowly = raf.bind(null, debounce(updatePreviewSummary, 300));
  const dateValidator = rome.val.after(moment().endOf(`day`));
  const romeOpts = {
    inputFormat: publicationFormat,
    dateValidator: dateValidator,
    timeValidator: timeValidator
  };
  let boundSlug = true;
  let authorSignet;

  title.on(`keypress keydown paste input`, typingTitleSlowly);
  slug.on(`keypress keydown paste input`, typingSlugSlowly);
  heroImage.on(`keypress keydown paste input bureaucrat`, typingHeroImageSlowly);
  summary.on(`keypress keydown paste input`, typingSummarySlowly);
  texts.on(`keypress keydown paste input`, typingTextSlowly);
  tags.on(`keypress keydown paste input`, typingTagsSlowly);
  discardButton.on(`click`, discard);
  saveButton.on(`click`, save);
  status.on(`change`, updatePublication);
  campaign.on(`change`, `.ck-input`, serializeSlowly);
  schedule.on(`change`, updatePublication);

  const tagSignet = insignia(tags[0], {
    preventInvalid: true,
    getText: getSlugText,
    getValue: getSlugText
  });

  horsey(tags[0], {
    source: getTagSuggestions,
    getText: getSlugText,
    getValue: getSlugText,
    limit: maxTagSuggestions,
    set: addTag,
    appendTo: tagsContainer,
    renderItem: renderHorseyTagItem
  });

  if (publication.length) {
    rome(publication[0], romeOpts);
  }

  if (owner) {
    initializeForOwner();
  }

  deserialize(editing && article);

  function initializeForOwner () {
    authorSignet = insignia(author[0], {
      free: false,
      deletion: true,
      preventInvalid: true,
      getText: getSlugText,
      getValue: getSlugText
    });

    horsey(author[0], {
      source: getAuthorSuggestions,
      getText: getSlugText,
      getValue: getSlugText,
      limit: maxTagSuggestions,
      set: setAuthor,
      appendTo: authorContainer,
      renderItem: renderHorseyAuthorItem,
      blankSearch: true
    });

    const slug = author.value();
    author.value(``);
    authorSignet.addItem(slug);
  }

  function getCurrentState () {
    return status.where(`:checked`).text() || `draft`;
  }

  function timeValidator (date) {
    const tf = `HH:mm:ss`;
    const time = moment(moment(date).format(tf), tf);
    return (
       time.isAfter(moment(`05:59:59`, tf)) &&
      time.isBefore(moment(`15:00:00`, tf))
    );
  }

  function getTagSuggestions (data, done) {
    const xhrOpts = {
      url: `/api/articles/tags`,
      json: true
    };
    taunus.xhr(xhrOpts, done);
  }
  function renderHorseyTagItem (li, tag) {
    $(li).addClass(`ac-tag-item`);
    taunus.partial(li, `author/articles/tag-item`, { tag: tag });
  }
  function addTag (tag) {
    tagSignet.addItem(tag);
    updatePreviewSummarySlowly();
  }
  function getTags () {
    return tagSignet.value();
  }

  function getSlugText (host) {
    return typeof host === `string` ? host : host.slug;
  }

  function getAuthorSuggestions (data, done) {
    const xhrOpts = {
      url: `/api/articles/authors`,
      json: true
    };
    taunus.xhr(xhrOpts, done);
  }
  function renderHorseyAuthorItem (li, user) {
    $(li).addClass(`ac-author-item`);
    taunus.partial(li, `author/articles/author-item`, { user });
  }

  function updatePublication () {
    serializeSlowly();

    if (published) {
      saveButton.find(`.bt-text`).text(`Save Changes`);
      saveButton.parent().attr(`aria-label`, `Make your modifications immediately accessible!`);
      discardButton.text(`Delete Article`);
      discardButton.attr(`aria-label`, `Permanently delete this article`);
      return;
    }
    const state = getCurrentState();
    if (state === `draft`) {
      saveButton.find(`.bt-text`).text(`Save Draft`);
      saveButton.parent().attr(`aria-label`, `You can access your drafts at any time`);
      return;
    }
    const scheduled = schedule.value();
    if (scheduled) {
      saveButton.find(`.bt-text`).text(`Schedule`);
      saveButton.parent().attr(`aria-label`, `Schedule this article for publication`);
      return;
    }
    if (state === `publish`) {
      saveButton.find(`.bt-text`).text(`Publish`);
      saveButton.parent().attr(`aria-label`, `Make the content immediately accessible!`);
    }
  }

  function setAuthor (author) {
    if (!authorSignet) {
      return;
    }
    const values = authorSignet.value();
    if (values.length > 0) {
      values.forEach(value => authorSignet.removeItem(value));
    }
    authorSignet.addItem(author);
  }

  function typingText () {
    serializeSlowly();
    updatePreviewMarkdownSlowly();
  }

  function typingTitle () {
    if (boundSlug) {
      updateSlug();
    }
    updatePreviewTitle();
    serializeSlowly();
  }

  function typingHeroImage () {
    updatePreviewHeroImage();
    serializeSlowly();
  }

  function typingSlug () {
    boundSlug = false;
    serializeSlowly();
  }

  function typingSummary () {
    serializeSlowly();
    updatePreviewSummarySlowly();
  }

  function getHtmlTitle () {
    const rstrip = /^\s*<p>\s*<\/p>\s*$/i;
    return getHtml(title).replace(rstrip, ``);
  }

  function updatePreviewTitleHtml () {
    previewTitle.html(getHtmlTitle());
  }

  function updatePreviewTitle () {
    updatePreviewTitleHtml();
    updatePreviewSummarySlowly();
  }

  function updateSlug () {
    updatePreviewTitleHtml();
    slug.value(sluggish(previewTitle.text()));
    updatePreviewSummarySlowly();
  }

  function updatePreviewHeroImage () {
    const heroUrl = heroImage.value().trim();
    if (heroUrl) {
      previewHeader.css({ backgroundImage: `url('` + heroUrl + `')` });
      previewHeader.addClass(`at-has-hero`);
      previewHeader.removeClass(`at-no-hero`);
    } else {
      previewHeader.css({ backgroundImage: null });
      previewHeader.removeClass(`at-has-hero`);
      previewHeader.addClass(`at-no-hero`);
    }
  }

  function typingTags () {
    updatePreviewSummarySlowly();
    serializeSlowly();
  }

  function updatePreviewMarkdown () {
    const rstrip = /^\s*<p>\s*<\/p>\s*$/i;
    previewTeaser.html(getHtml(teaser));
    const note = getHtml(editorNote).replace(rstrip, ``);
    if (note.length) {
      previewEditorNote.removeClass(`uv-hidden`).html(note);
    } else {
      previewEditorNote.addClass(`uv-hidden`);
    }
    previewIntroduction.html(getHtml(introduction));
    previewBody.html(getHtml(body));
    preview.forEach(twitterService.updateView);
    if (!summary.value()) {
      updatePreviewSummary();
    }
  }

  function updatePreviewSummary () {
    const teaserHtml = getHtml(teaser);
    const editorNoteHtml = getHtml(editorNote);
    const introductionHtml = getHtml(introduction);
    const bodyHtml = getHtml(body);
    const summarized = articleSummarizationService.summarize({
      summary: summary.value(),
      teaserHtml: teaserHtml,
      introductionHtml: introductionHtml
    });
    const parts = [teaserHtml, editorNoteHtml || ``, introductionHtml, bodyHtml];
    const readingTime = estimate.text(parts.join(` `));
    const publication = datetimeService.field(moment().add(4, `days`));
    const article = {
      publication: publication,
      commentCount: 0,
      slug: slug.value(),
      readingTime: readingTime,
      titleHtml: getHtmlTitle(),
      tags: getTags(),
      author: {
        displayName: viewModel.article.author.displayName
      },
      summaryHtml: summarized.html
    };
    const vm = { articles: [article] };
    taunus.partial(previewSummary, `articles/columns`, vm);
  }

  function getHtml (el) { return markdownService.compile(el.value()); }
  function serialize () { storage.set(defaultStorageKey, getRequestData()); }
  function clear () { storage.remove(defaultStorageKey); }

  function deserialize (source) {
    const data = source || storage.get(defaultStorageKey) || {
      email: true, tweet: true, fb: true, echojs: true, hn: true
    };
    const titleText = data.titleMarkdown || ``;
    const slugText = data.slug || ``;

    title.value(titleText);
    slug.value(slugText);
    heroImage.value(data.heroImage || ``);
    teaser.value(data.teaser || ``);
    introduction.value(data.introduction || ``);
    editorNote.value(data.editorNote || ``);
    body.value(data.body || ``);
    summary.value(data.summary || ``);

    (data.tags || []).forEach(addTag);

    if (data.authorSlug) {
      setAuthor(data.authorSlug);
    }

    email.value(data.email);
    tweet.value(data.tweet);
    fb.value(data);
    echojs.value(data.echojs);
    hn.value(data.hn);

    if (data.status !== `published`) {
      statusRadio[data.status || `publish`].value(true);

      if (`publication` in data) {
        schedule.value(true);
      }
    }

    updatePreviewTitle();
    updatePreviewHeroImage();
    updatePreviewMarkdown();
    updatePublication();

    boundSlug = sluggish(previewTitle.text()) === slugText;
  }

  function getRequestData () {
    const individualTags = getTags();
    const state = published ? article.status : getCurrentState();
    const data = {
      titleMarkdown: title.value(),
      slug: slug.value(),
      summary: summary.value(),
      teaser: teaser.value(),
      editorNote: editorNote.value(),
      introduction: introduction.value(),
      body: body.value(),
      tags: individualTags,
      heroImage: heroImage.value().trim(),
      status: state,
      email: email.value(),
      tweet: tweet.value(),
      fb: fb.value(),
      echojs: echojs.value(),
      hn: hn.value()
    };
    if (authorSignet) {
      data.authorSlug = authorSignet.value()[0];
    }
    const scheduled = schedule.value();
    if (scheduled && !published) {
      data.publication = moment(publication.value(), publicationFormat).format();
    }
    return data;
  }

  function save () {
    const data = getRequestData();
    send({ json: data });
  }

  function send (data) {
    let req;

    if (editing) {
      req = viewModel.measly.patch(`/api/articles/` + route.params.slug, data);
    } else {
      req = viewModel.measly.put(`/api/articles`, data);
    }
    req.on(`data`, leave);
  }

  function discard () {
    const name = route.params.slug ? `/articles/` + route.params.slug : `draft`;
    const confirmation = confirm(`About to discard ` + name + `, are you sure?`);
    if (!confirmation) {
      return;
    }
    if (editing) {
      viewModel.measly.delete(`/api/articles/` + route.params.slug).on(`data`, leave);
    } else {
      leave();
    }
  }

  function leave () {
    clear();
    taunus.navigate(`/articles/review`);
  }
}
