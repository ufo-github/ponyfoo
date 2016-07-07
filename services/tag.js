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
    var known = result.knownTags.filter(addKnownTagDetails);

    done(null, {
      used: _.sortBy(used, 'slug'),
      known: _.sortBy(known, 'slug')
    });

    function addKnownTagDetails (knownTag) {
      var i = plainTags.indexOf(knownTag.slug);
      if (i === -1) {
        return true;
      }
      used[i] = knownTag;
    }
  }
}

function asTagSlug (tag) {
  return { slug: tag };
}

module.exports = {
 getAll: getAll
};
