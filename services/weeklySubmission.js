'use strict';

var fs = require('fs');
var pdf = require('html-pdf');
var util = require('util');
var path = require('path');
var contra = require('contra');
var moment = require('moment');
var winston = require('winston');
var sluggish = require('sluggish');
var User = require('../models/User');
var cryptoService = require('./crypto');
var markupService = require('./markup');
var emailService = require('./email');
var viewService = require('./view');
var gravatarService = require('./gravatar');
var weeklyCompilerService = require('./weeklyCompiler');
var invoiceModelService = require('./invoiceModel');
var Invoice = require('../models/Invoice');
var InvoiceParty = require('../models/InvoiceParty');
var env = require('../lib/env');
var pkg = require('../package.json');
var authority = env('AUTHORITY');
var from = env('MAILGUN_SENDER');
var paymentPartySlug = env('SUBMISSION_INVOICE_PAYMENT_SLUG');
var css = fs.readFileSync('.bin/static/newsletter-email.css', 'utf8');
var submissionTypes = {
  suggestion: 'link suggestion',
  primary: 'primary sponsorship request',
  secondary: 'sponsored link request',
  job: 'job listing request'
};
var invoiceItems = {
  primary: 'Primary Sponsorship',
  secondary: 'Sponsored Link',
  job: 'Job Listing'
};
var invoiceRates = {
  primary: 70,
  secondary: 50,
  job: 35
};
var tmpdir = path.join(process.cwd(), 'tmp');
var rdigits = /^\d+$/;

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
  var tasks = {
    owners: findOwners,
    previewHtml: compilePreview,
    gravatar: fetchGravatar,
    invoice: generateInvoice
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

  function fetchGravatar (next) {
    gravatarService.fetch(submission.email, fetched);
    function fetched (err, gravatar) {
      if (err) {
        next(err); return;
      }
      gravatar.name = 'gravatar';
      next(null, gravatar);
    }
  }

  function generateInvoice (next) {
    if (!submission.invoice) {
      next(null); return;
    }
    var now = moment();
    var invoiceSlug = sluggish(util.format('%s-%s-%s',
      submission.email.split('@')[0],
      getRandomCode().slice(0, 4),
      now.format('YYMMDD')
    ));
    var partyQuery = {
      slug: paymentPartySlug,
      type: 'payment'
    };

    InvoiceParty
      .findOne(partyQuery)
      .exec(foundParty);

    function foundParty (err, paymentParty) {
      if (err) {
        next(err); return;
      }
      if (!paymentParty) {
        next(new Error('Payment party not found.')); return;
      }
      var invoiceModel = {
        date: now.toDate(),
        slug: invoiceSlug,
        customer: {
          name: submission.submitter || submission.email,
          details: submission.email
        },
        paymentParty: paymentParty,
        items: [{
          summary: 'Pony Foo Weekly ' + invoiceItems[submission.subtype],
          amount: submission.amount,
          rate: invoiceRates[submission.subtype]
        }],
        paid: false
      };
      new Invoice(invoiceModel).save(saved);
    }

    function saved (err, invoice) {
      if (err) {
        next(err); return;
      }
      var invoiceModel = invoiceModelService.generateModel(invoice);
      var viewModel = {
        leanLayout: true,
        model: {
          title: 'Invoice #' + invoiceSlug + ' \u2014 Pony Foo',
          invoice: invoiceModel,
          pdf: true
        }
      };
      viewService.render('invoices/invoice', viewModel, rendered);

      function rendered (err, html) {
        if (err) {
          next(err); return;
        }
        var filename = invoiceSlug + '.pdf';
        var filepath = path.join(tmpdir, util.format('%s.%s.pdf', invoiceSlug, getRandomCode()));
        var options = {
          base: authority,
          border: '40px',
          width: '1440px',
          height: '1200px'
        };
        pdf.create(html, options).toFile(filepath, generated);
        function generated (err) {
          if (err) {
            next(err); return;
          }
          next(null, { name: filename, file: filepath });
        }
      }
    }
  }

  function prepareModel (err, result) {
    if (err) {
      error(err); return;
    }
    var verify = getToken(submission);
    var permalink = util.format('/weekly/submissions/%s/edit?verify=%s', submission.slug, verify);
    var everyone = [submission.email].concat(result.owners.map(toEmail));
    var attachments = result.invoice ? [result.invoice] : [];
    var model = {
      to: submission.email,
      cc: everyone,
      subject: 'We got your submission to Pony Foo Weekly! 🎉',
      teaserHtml: util.format('Here’s a link to  <a href="%s">review your submission</a>.', authority + permalink),
      teaserRight: 'We’ll be in touch soon!',
      css: css,
      permalink: permalink,
      images: [result.gravatar],
      attachments: attachments,
      submission: {
        type: submissionTypes[submission.subtype],
        submitter: submission.submitter,
        commentHtml: submission.commentHtml,
        previewHtml: result.previewHtml,
        invoice: submission.invoice
      },
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
    emailService.send('newsletter-submission-ack', model, done);
  }

  function error (err) {
    (done || logger)(err);
  }
}

function toEmail (user) {
  return user.email;
}

function logger (err) {
  var description = 'Uncaught exception while sending email about weekly submission.';
  var data = { stack: err.stack || err.message || err || '(unknown)' };
  winston.error(description, data);
}

function getRandomCode () {
  return Math.random().toString(18).substr(2);
}

module.exports = {
  isEditable: isEditable,
  getToken: getToken,
  notify: notify
};
