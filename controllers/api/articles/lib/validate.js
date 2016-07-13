'use strict';

var util = require('util');
var moment = require('moment');
var sluggish = require('sluggish');
var validator = require('validator');
var Article = require('../../../../models/Article');
var textService = require('../../../../services/text');
var statuses = Article.validStatuses;

function validate (model, options) {
  var validation = [];
  if (!model || typeof model !== 'object') {
    validation.push('Invalid request.');
    return validation;
  }
  var status = getStatus();
  var draft = status === 'draft';
  var sanitized = {
    status: status,
    titleMarkdown: getTitle(),
    slug: getSlug(),
    summary: validator.toString(model.summary),
    teaser: getContent('teaser', { required: !draft }),
    introduction: getContent('introduction', { required: !draft }),
    body: getContent('body', { required: !draft }),
    tags: draft ? getTagsRaw() : getTags(),
    comments: [],
    related: [],
    email: !!model.email,
    tweet: !!model.tweet,
    fb: !!model.fb,
    echojs: !!model.echojs,
    hn: !!model.hn
  };
  var publication = getPublicationDate();
  if (publication) {
    sanitized.publication = publication;
  } else if (model.status !== 'published') {
    sanitized.publication = void 0;
  }
  if (options.editor && !options.originalAuthor) { // prevent drafters from overwriting data they can't see
    sanitized.editorNote = getContent('editorNote', { required: false });
  }
  if (options.update) {
    delete sanitized.comments;
    delete sanitized.related;
    if (!options.editor) { // prevent drafters from overwriting data they can't see
      delete sanitized.email;
      delete sanitized.tweet;
      delete sanitized.fb;
      delete sanitized.echojs;
      delete sanitized.hn;
    }
  }
  validation.model = sanitized;
  return validation;

  function getPublicationDate () {
    if (model.publication && model.status !== 'published') {
      var when = moment(model.publication);
      if (!when.isValid()) {
        validation.push('The publication date is invalid.');
      }
      if (when.isBefore(moment())) {
        validation.push('Pick a publication date in the future. I don’t have superpowers.');
      }
      return when.toDate();
    }
  }

  function getStatus () {
    if (statuses.indexOf(model.status) !== -1) {
      return validator.toString(model.status);
    }
    validation.push('The provided status is invalid.');
  }

  function getTitle () {
    var length = 3;
    if (validator.isLength(model.titleMarkdown, length)) {
      return validator.toString(model.titleMarkdown);
    }
    var message = util.format('The title must be at least %s characters long.', length);
    validation.push(message);
  }

  function getSlug () {
    var length = 3;
    var input = validator.toString(model.slug);
    var slug = sluggish(input);
    if (!validator.isLength(slug, length)) {
      var message = util.format('The article slug must be at least %s characters long.', length);
      validation.push(message);
    }
    var rforbidden = /^feed|archives|history$/ig;
    if (rforbidden.test(slug)) {
      validation.push('The provided slug is reserved and can’t be used');
    }
    return slug;
  }

  function getContent (prop, options) {
    var length = 3;
    var message;
    var input = validator.toString(model[prop]);
    if (!validator.isLength(input, length)) {
      message = util.format('The article %s must be at least %s characters long.', prop, length);
      if (options.required) {
        validation.push(message);
      }
    }
    return input.replace(/http:\/\/i\.imgur\.com\//g, 'https://i.imgur.com/');
  }

  function getTags () {
    var raw = getTagsRaw();
    if (raw.length > 6) {
      validation.push('You can choose 6 categories at most.'); return;
    }
    if (raw.length === 0) {
      validation.push('The article must be tagged under at least one category.'); return;
    }
    return raw;
  }

  function getTagsRaw () {
    var input = Array.isArray(model.tags) ? model.tags.join(' ') : validator.toString(model.tags);
    var tags = textService.splitTags(input);
    return tags;
  }
}

module.exports = validate;
