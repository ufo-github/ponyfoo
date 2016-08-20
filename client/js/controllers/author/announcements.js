'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const taunus = require(`taunus`);
const debounce = require(`lodash/debounce`);
const markdownService = require(`../../../../services/markdown`);

module.exports = function (viewModel) {
  const subject = $(`.ec-subject`);
  const teaser = $(`.ec-teaser`);
  const body = $(`.ec-body`);
  const topic = $(`.ec-topic`);
  const previewSubject = $(`.ec-preview-subject`);
  const previewTeaser = $(`.ec-preview-teaser`);
  const previewBody = $(`.ec-preview-body`);
  const sendButton = $(`.ec-send`);

  subject.on(`keypress keydown paste`, raf.bind(null, debounce(updatePreviewSubject, 200)));
  teaser.on(`keypress keydown paste`, raf.bind(null, debounce(updatePreviewTeaser, 200)));
  body.on(`keypress keydown paste input`, raf.bind(null, debounce(updatePreviewBody, 200)));
  sendButton.on(`click`, send);

  function updatePreviewSubject () {
    previewSubject.text(subject.value().trim() || `Email Preview`);
  }
  function updatePreviewTeaser () {
    previewTeaser.text(teaser.value() || `Teaser about email contents`);
  }
  function updatePreviewBody () {
    const rstrip = /^\s*<p>\s*<\/p>\s*$/i;
    previewBody.html(getHtml(body).trim().replace(rstrip, ``) || `Main body of your email`);
  }

  function getHtml (el) { return markdownService.compile(el.value()); }

  function send () {
    const model = {
      json: {
        topic: topic.value(),
        subject: subject.value(),
        teaser: teaser.value(),
        body: body.value()
      }
    };
    viewModel.measly.post(`/api/email`, model).on(`data`, leave);
  }

  function leave () {
    taunus.navigate(`/`);
  }
};
