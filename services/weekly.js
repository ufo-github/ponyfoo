'use strict';

var _ = require('lodash');
var but = require('but');
var WeeklyIssue = require('../models/WeeklyIssue');
var weeklyCompilerService = require('./weeklyCompiler');
var commentService = require('./comment');
var datetimeService = require('./datetime');
var summaryService = require('./summary');
var markupService = require('./markup');
var htmlService = require('./html');
var cryptoService = require('./crypto');

function compile (model, done) {
  weeklyCompilerService.compile(model.sections, { markdown: markupService }, compiled);
  function compiled (err, html) {
    if (err) {
      done(err); return;
    }
    model.summaryHtml = markupService.compile(model.summary, {
      absolutize: true,
      linkThrough: weeklyCompilerService.linkThrough
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
      issue.email = model.email;
      issue.tweet = model.tweet;
      issue.fb = model.fb;
      issue.echojs = model.echojs;
      issue.lobsters = model.lobsters;
      issue.hn = model.hn;
      issue.save(but(done));
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
  var released = doc.status === 'released' && doc.statusReach === 'everyone';
  var permalink = '/weekly/' + doc.slug;
  if (!released) {
    permalink += '?verify=' + cryptoService.md5(doc._id + doc.created);
  }
  return {
    _id: doc._id,
    created: doc.created,
    updated: datetimeService.field(doc.updated),
    publication: datetimeService.field(doc.publication),
    name: doc.name,
    slug: doc.slug,
    status: doc.status,
    statusReach: doc.statusReach,
    permalink: permalink
  };
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
