'use strict';

var _ = require('lodash');
var but = require('but');
var WeeklyIssue = require('../models/WeeklyIssue');
var weeklyCompilerService = require('./weeklyCompiler');
var weeklyCompilerLinkService = require('./weeklyCompilerLink');
var commentService = require('./comment');
var datetimeService = require('./datetime');
var summaryService = require('./summary');
var markupService = require('./markup');
var userService = require('./user');
var htmlService = require('./html');
var cryptoService = require('./crypto');
var rdigits = /^\d+$/;

function compile (model, done) {
  var slug = rdigits.test(model.slug) ? 'issue-' + model.slug : model.slug;
  var options = {
    markdown: markupService,
    slug: slug
  };
  weeklyCompilerService.compile(model.sections, options, compiled);
  function compiled (err, html) {
    if (err) {
      done(err); return;
    }
    var linkThrough = weeklyCompilerLinkService.linkThroughForSlug(slug);
    model.summaryHtml = markupService.compile(model.summary, {
      absolutize: true,
      linkThrough: linkThrough
    });
    model.summaryText = summaryService.summarize(model.summaryHtml).text;
    model.contentHtml = htmlService.absolutize(html);
    done(null, model);
  }
}

function insert (model, done) {
  compile(model, compiled);
  function compiled (err, model) {
    if (err) {
      done(err); return;
    }
    var doc = new WeeklyIssue(model);
    doc.save(but(done));
  }
}

function update (options, done) {
  var query = { slug: options.slug };
  var model = options.model;
  WeeklyIssue.findOne(query, found);
  function found (err, issue) {
    if (err) {
      done(err); return;
    }
    if (!issue) {
      done(new Error('Weekly issue not found.')); return;
    }
    compile(model, compiled);
    function compiled (err, model) {
      if (err) {
        done(err); return;
      }
      if (issue.status !== 'released') {
        issue.status = model.status;
      }
      issue.updated = Date.now();
      issue.slug = model.slug;
      issue.sections = model.sections;
      issue.summary = model.summary;
      issue.summaryHtml = model.summaryHtml;
      issue.summaryText = model.summaryText;
      issue.contentHtml = model.contentHtml;
      updateFlag('email');
      updateFlag('tweet');
      updateFlag('fb');
      updateFlag('echojs');
      updateFlag('hn');
      issue.save(but(done));

      function updateFlag (key) {
        if (typeof model[key] === 'boolean') {
          issue[key] = model[key];
        }
      }
    }
  }
}

function getAllTags (weeklyIssue) {
  return _(weeklyIssue.sections)
    .map(toTags)
    .flatten()
    .concat(['javascript', 'css'])
    .uniq()
    .value();
  function toTags (section) {
    return section.tags || [];
  }
}

function toMetadata (doc) {
  var released = doc.status === 'released';
  var patrons = doc.statusReach === 'patrons';
  var everyone = doc.statusReach === 'everyone';
  var permalink = getPermalink();
  return {
    created: datetimeService.field(doc.created),
    updated: datetimeService.field(doc.updated),
    publication: datetimeService.field(doc.publication),
    author: {
      slug: doc.author.slug,
      avatar: userService.getAvatar(doc.author)
    },
    name: doc.name,
    slug: doc.slug,
    status: doc.status,
    statusReach: doc.statusReach,
    shareable: released && everyone,
    permalink: permalink
  };
  function getPermalink () {
    var base = '/weekly/' + doc.slug;
    if (!released) {
      return base + '?verify=' + hash(doc.created);
    } else if (patrons) {
      return base + '?thanks=' + hash(doc.thanks);
    }
    return base;
  }
  function hash (value) {
    return cryptoService.md5(doc._id + value);
  }
}

function toView (doc) {
  return commentService.hydrate({
    name: doc.name,
    slug: doc.slug,
    publication: datetimeService.field(doc.publication),
    status: doc.status,
    statusReach: doc.statusReach,
    summaryHtml: doc.summaryHtml,
    contentHtml: doc.contentHtml
  }, doc);
}

function toHistory (doc) {
  return {
    name: doc.name,
    slug: doc.slug,
    publication: datetimeService.field(doc.publication)
  };
}

module.exports = {
  compile: compile,
  insert: insert,
  update: update,
  toMetadata: toMetadata,
  toView: toView,
  toHistory: toHistory,
  getAllTags: getAllTags
};
