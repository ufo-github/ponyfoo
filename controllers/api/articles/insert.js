'use strict';

var util = require('util');
var moment = require('moment');
var validator = require('validator');
var Article = require('../../../models/Article');
var textService = require('../../../services/text');
var statuses = Article.validStatuses;

module.exports = function (req, res, next) {
  var body = req.body;
  if (!body || typeof body !== 'object') {
    res.json(400, { messages: ['Invalid request'] }); return;
  }
  var validation = [];
  var model = {
    publication: getPublicationDate(body).zone(0).format(),
    status: getStatus(),
    title: getTitle(),
    slug: getSlug(),
    introduction: getContent('introduction'),
    body: getContent('body'),
    tags: getTags()
  };
  if (validation.length) {
    res.json(400, { messages: validation }); return;
  }
  res.json(200, model);

  // TODO other fields?
  // TODO validate slug
  // TODO compute HTML
  // TODO insert
  // TODO prev, next
  // TODO compute related

  function getPublicationDate () {
    var when;
    if (body.publication) {
      when = moment(body.publication);
      if (when.isValid()) {
        return when;
      }
    }
    return moment();
  }

  function getStatus () {
    if (statuses.indexOf(body.status) !== -1) {
      return validator.toString(body.status);
    }
    validation.push('The provided status is invalid.');
  }

  function getTitle () {
    if (validator.isLength(body.title, 6)) {
      return validator.toString(body.title);
    }
    validation.push('The title must be at least 6 characters long.');
  }

  function getSlug () {
    var input = validator.toString(body.slug);
    var slug = textService.slug(input);
    if (validator.isLength(slug, 6)) {
      return slug;
    }
    validation.push('The article slug must be at least 6 characters long.');
  }

  function getContent (prop) {
    var input = validator.toString(body[prop]);
    if (validator.isLength(input, 30)) {
      return input;
    }
    validation.push(util.format('The article %s must be at least 30 characters long.', prop));
  }

  function getTags () {
    var input = Array.isArray(body.tags) ? body.tags.join(' ') : validator.toString(body.tags);
    var tags = textService.splitTags(input);
    if (tags.length > 0) {
      return tags;
    }
    validation.push('The article must be tagged under at least one category.');
  }
};
