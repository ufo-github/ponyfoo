'use strict';

var _ = require('lodash');
var but = require('but');
var WeeklyIssue = require('../models/WeeklyIssue');
var weeklyCompilerService = require('./weeklyCompiler');
var commentService = require('./comment');
var datetimeService = require('./datetime');
var summaryService = require('./summary');
var markupService = require('./markup');
var cryptoService = require('./crypto');

function insert (model, done) {
  weeklyCompilerService.compile(model.sections, { markdown: markupService }, compiled);
  function compiled (err, html) {
    if (err) {
      done(err); return;
    }
    model.summaryHtml = markupService.compile(model.summary);
    model.summaryText = summaryService.summarize(model.summaryHtml).text;
    model.contentHtml = html;
    var doc = new WeeklyIssue(model);
    doc.save(but(done));
  }
}

function update (options, done) {
  var model = options.model;
  WeeklyIssue.findOne({
    author: options.author,
    slug: options.slug
  }, found);
  function found (err, issue) {
    if (err) {
      done(err); return;
    }
    if (!issue) {
      done(new Error('Weekly issue not found.')); return;
    }
    weeklyCompilerService.compile(model.sections, { markdown: markupService }, compiled);
    function compiled (err, html) {
      if (err) {
        done(err); return;
      }
      issue.updated = Date.now();
      issue.slug = model.slug;
      issue.sections = model.sections;
      issue.contentHtml = html;
      if (issue.status !== 'released') {
        issue.status = model.status;
      }
      issue.summary = model.summary;
      issue.summaryHtml = markupService.compile(issue.summary);
      issue.summaryText = summaryService.summarize(issue.summaryHtml).text;
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
  var released = doc.status === 'released';
  var permalink = '/weekly/' + doc.slug;
  if (!released) {
    permalink += '?verify=' + cryptoService.md5(doc._id + doc.created);
  }
  return {
    _id: doc._id,
    created: doc.created,
    updated: datetimeService.field(doc.updated),
    title: doc.title,
    slug: doc.slug,
    status: doc.status,
    statusReach: doc.statusReach,
    permalink: permalink
  };
}

function toView (doc, comments) {
  return commentService.hydrate({
    title: doc.title,
    slug: doc.slug,
    publication: datetimeService.field(doc.publication),
    summaryHtml: doc.summaryHtml,
    contentHtml: doc.contentHtml
  }, doc);
}

module.exports = {
  insert: insert,
  update: update,
  toMetadata: toMetadata,
  toView: toView,
  getAllTags: getAllTags
};
