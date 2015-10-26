'use strict';

var util = require('util');
var moment = require('moment');
var validator = require('validator');
var Article = require('../../../../models/Article');
var textService = require('../../../../services/text');
var statuses = Article.validStatuses;
var forbidden = /^feed|archives|history$/ig;

function validate (model, update) {
  var validation = [];
  if (!model || typeof model !== 'object') {
    validation.push('Invalid request.');
    return validation;
  }
  var sanitized = {
    status: getStatus(),
    title: getTitle(),
    slug: getSlug(),
    teaser: getContent('teaser'),
    introduction: getContent('introduction'),
    body: getContent('body'),
    tags: getTags(),
    comments: [],
    related: [],
    email: !!model.email,
    tweet: !!model.tweet,
    fb: !!model.fb,
    echojs: !!model.echojs,
    hn: !!model.hn,
    lobsters: !!model.lobsters
  };
  var publication = getPublicationDate();
  if (publication) {
    sanitized.publication = publication;
  } else if (model.status !== 'published') {
    sanitized.publication = void 0;
  }
  validation.model = sanitized;

  if (update) {
    delete sanitized.comments;
    delete sanitized.related;
  }

  return validation;

  function getPublicationDate () {
    if (model.publication && model.status !== 'published') {
      var when = moment(model.publication);
      if (!when.isValid()) {
        validation.push('The publication date is invalid.');
      }
      if (when.isBefore(moment())) {
        validation.push('Pick a publication date in the future. I don\'t have superpowers.');
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
    if (validator.isLength(model.title, length)) {
      return validator.toString(model.title);
    }
    var message = util.format('The title must be at least %s characters long.', length);
    validation.push(message);
  }

  function getSlug () {
    var length = 3;
    var input = validator.toString(model.slug);
    var slug = textService.slug(input);
    if (!validator.isLength(slug, length)) {
      var message = util.format('The article slug must be at least %s characters long.', length);
      validation.push(message);
    }
    if (forbidden.test(slug)) {
      validation.push('The provided slug is reserved and can\'t be used');
    }
    return slug;
  }

  function getContent (prop) {
    var length = 3;
    var message;
    var input = validator.toString(model[prop]);
    if (!validator.isLength(input, length)) {
      message = util.format('The article %s must be at least %s characters long.', prop, length);
      validation.push(message);
      return;
    }
    return input.replace(/http:\/\/i\.imgur\.com\//g, 'https://i.imgur.com/');
  }

  function getTags () {
    var input = Array.isArray(model.tags) ? model.tags.join(' ') : validator.toString(model.tags);
    var tags = textService.splitTags(input);
    if (tags.length > 6) {
      validation.push('You can choose 6 categories at most.'); return;
    }
    if (tags.length === 0) {
      validation.push('The article must be tagged under at least one category.'); return;
    }
    return tags;
  }
}

module.exports = validate;
