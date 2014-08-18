'use strict';

var contra = require('contra');
var util = require('util');
var moment = require('moment');
var validator = require('validator');
var Article = require('../../../models/Article');
var textService = require('../../../services/text');
var statuses = Article.validStatuses;

module.exports = function (req, res, next) {
  var body = req.body;
  var validation = [];
  var model = validateRequest(req, res, next);

  if (validation.length) {
    invalid(); return;
  }

  contra.waterfall([
    function lookupSlug (next) {
      Article.findOne({ slug: model.slug }, next);
    },
    function validateSlug (existing, next) {
      if (existing) {
        validation.push('The slug you provided is already in use. Please change it.');
      }
      next(validation.length);
    },
    function statusRouter (next) {
      if (model.status === 'publish') {
        publish(next);
      } else {
        new Article(model).save(next);
      }
    }
  ], respond);

  function respond (err) {
    if (err) {
      if (validation.length) {
        invalid();
      } else {
        next(err);
      }
    }
    res.json(200, model);
  }

  function invalid () {
    res.json(400, { messages: validation });
  }

  function validateRequest () {
    if (!body || typeof body !== 'object') {
      validation.push('Invalid request.'); return;
    }
    return {
      publication: getPublicationDate(body).zone(0).format(),
      status: getStatus(),
      title: getTitle(),
      slug: getSlug(),
      introduction: getContent('introduction'),
      body: getContent('body'),
      tags: getTags()
    };
  }

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
    if (tags.length > 6) {
      validation.push('You can choose 6 categories at most.'); return;
    }
    if (tags.length === 0) {
      validation.push('The article must be tagged under at least one category.'); return;
    }
    return tags;
  }

  function publish (done) {
    contra.waterfall([
      function lookupPrevious (next) {
        Article.findOne({ status: 'published' }).sort('-publication').exec(next);
      },
      function insertArticle (prev, next) {
        if (prev) {
          model.prev = prev._id;
        }
        model.publication = Date.now;
        model.status = 'published';

        new Article(model).save(function inserted (err) {
          next(err, prev, this);
        });
      },
      function updatePrevious (prev, current, next) {
        if (!prev) {
          next(); return;
        }
        prev.next = current._id;
        prev.save(next);
      }
    ], done);
  }
};
