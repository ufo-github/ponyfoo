'use strict';

var _ = require('lodash');
var contra = require('contra');
var Article = require('../models/Article');
var KnownTag = require('../models/KnownTag');

function getAll (done) {
  var tasks = {
    plainTags: findTags,
    knownTags: findKnownTags
  };

  contra.concurrent(tasks, merge);

  function findTags (next) {
    Article.find({}).distinct('tags').lean().exec(next);
  }

  function findKnownTags (next) {
    KnownTag.find({}).lean().exec(next);
  }

  function merge (err, result) {
    if (err) {
      done(err); return;
    }
    var plainTags = result.plainTags;
    var used = plainTags.map(asTagSlug);
    var unused = result.knownTags.filter(addKnownAsUsedTags).map(toKnownTagModel);

    done(null, {
      used: _.sortBy(used, 'slug'),
      unused: _.sortBy(unused, 'slug')
    });

    function addKnownAsUsedTags (knownTag) {
      var i = plainTags.indexOf(knownTag.slug);
      if (i === -1) {
        return true;
      }
      used[i] = toKnownTagModel(knownTag);
    }
  }
}

function asTagSlug (tag) {
  return { slug: tag };
}

function toKnownTagModel (tag) {
  return {
    slug: tag.slug,
    titleHtml: tag.titleHtml,
    descriptionHtml: tag.descriptionHtml,
    known: true
  };
}

module.exports = {
 getAll: getAll,
 toKnownTagModel: toKnownTagModel
};
