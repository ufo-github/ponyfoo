'use strict';

var fs = require('fs');
var util = require('util');
var contra = require('contra');
var User = require('../models/User');
var cryptoService = require('./crypto');
var markupService = require('./markup');
var emailService = require('./email');
var weeklyCompilerService = require('./weeklyCompiler');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var rdigits = /^\d+$/;
var css = fs.readFileSync('.bin/static/newsletter-email.css', 'utf8');

function noop () {}

function isEditable (options, done) {
  var submission = options.submission;
  var verify = options.verify;
  var userId = options.userId;
  if (userId) {
    User.findOne({ _id: userId }, validate);
  } else {
    validate();
  }
  function validate (err, user) {
    if (err) {
      done(err); return;
    }
    var owner = user && user.roles.indexOf('owner') !== -1;
    if (!valid()) {
      done('route'); return;
    }
    done(null, submission, owner);
    function valid () {
      if (owner) {
        return true;
      }
      return (
        submission.status === 'incoming' &&
        verify &&
        verify === getToken(submission)
      );
    }
  }
}

function getToken (submission) {
  return cryptoService.md5(submission._id + submission.created);
}

function notify (submission, done) {
  var end = done || noop;
  var tasks = {
    owners: findOwners,
    previewHtml: compilePreview
  };
  contra.concurrent(tasks, prepareModel);

  function findOwners (next) {
    var ownerQuery = { roles: 'owner' };
    User
      .find(ownerQuery)
      .select('email')
      .lean()
      .exec(next);
  }

  function compilePreview (next) {
    var options = {
      markdown: markupService,
      slug: 'submission-preview'
    };
    weeklyCompilerService.compile([submission.section], options, next);
  }

  function prepareModel (err, result) {
    if (err) {
      end(err); return;
    }
    var verify = getToken(submission);
    var permalink = util.format('/weekly/submissions/%s/edit?verify=%s', submission.slug, verify);
    var model = {
      to: submission.email,
      cc: result.owners.map(toEmail),
      subject: 'We got your submission to Pony Foo Weekly! 🎉',
      teaserHtml: util.format('Here’s a link to  <a href="%s">review your submission</a>.', authority + permalink),
      teaserRight: 'We’ll be in touch soon!',
      css: css,
      permalink: permalink,
      previewHtml: result.previewHtml,
      linkedData: {
        '@context': 'http://schema.org',
        '@type': 'EmailMessage',
        potentialAction: {
          '@type': 'ConfirmAction',
          name: 'Review Submission',
          handler: {
            '@type': 'HttpActionHandler',
            url: authority + permalink
          }
        },
        description: 'Review Submission – Pony Foo'
      }
    };

    // 1. fix issues with cc/bcc in real send
    // 2. personalize email with submission model, include commentHtml, etc.
    // 3. attach invoice?
    emailService.send('newsletter-submission-ack', model);
  }
}

function toEmail (user) {
  return user.email;
}

module.exports = {
  isEditable: isEditable,
  getToken: getToken,
  notify: notify
};
