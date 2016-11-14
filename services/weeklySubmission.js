'use strict'

const fs = require(`fs`)
const pdf = require(`html-pdf`)
const util = require(`util`)
const path = require(`path`)
const contra = require(`contra`)
const moment = require(`moment`)
const winston = require(`winston`)
const assign = require(`assignment`)
const sluggish = require(`sluggish`)
const User = require(`../models/User`)
const gravatarService = require(`./gravatar`)
const summaryService = require(`./summary`)
const cryptoService = require(`./crypto`)
const markupService = require(`./markup`)
const emailService = require(`./email`)
const viewService = require(`./view`)
const weeklyCompilerService = require(`./weeklyCompiler`)
const invoiceModelService = require(`./invoiceModel`)
const Invoice = require(`../models/Invoice`)
const InvoiceParty = require(`../models/InvoiceParty`)
const env = require(`../lib/env`)
const authority = env(`AUTHORITY`)
const ownerEmail = env(`OWNER_EMAIL`)
const paymentPartySlug = env(`SUBMISSION_INVOICE_PAYMENT_SLUG`)
const css = fs.readFileSync(`.bin/static/newsletter-email.css`, `utf8`)
const submissionTypes = {
  suggestion: `link suggestion`,
  primary: `primary sponsorship request`,
  secondary: `sponsored link request`,
  job: `job listing request`
}
const invoiceItems = {
  primary: `Primary Sponsorship`,
  secondary: `Sponsored Link`,
  job: `Job Listing`
}
const invoiceRates = {
  primary: 70,
  secondary: 50,
  job: 35
}
const tmpdir = path.join(process.cwd(), `tmp`)
const maxTitleLength = 50

function noop () {}

function isEditable (options, done) {
  const submission = options.submission
  const verify = options.verify
  const userId = options.userId
  if (userId) {
    User.findOne({ _id: userId }, validate)
  } else {
    validate()
  }
  function validate (err, user) {
    if (err) {
      done(err); return
    }
    const owner = user && user.roles.indexOf(`owner`) !== -1
    if (!valid()) {
      done(`route`); return
    }
    done(null, submission, owner)
    function valid () {
      if (owner) {
        return true
      }
      return (
        submission.status === `incoming` &&
        verify &&
        verify === getToken(submission)
      )
    }
  }
}

function getToken (submission) {
  return cryptoService.md5(submission._id + submission.created)
}

function findOwners (next) {
  const ownerQuery = { roles: `owner` }
  User
    .find(ownerQuery)
    .select(`email`)
    .lean()
    .exec(next)
}

function compilePreview (submission) {
  return compiler
  function compiler (next) {
    const options = {
      markdown: markupService,
      slug: `submission-preview`
    }
    weeklyCompilerService.toLinkSectionModel(submission.section, options, gotModel)
    function gotModel (err, model) {
      if (err) {
        next(err); return
      }
      const html = weeklyCompilerService.compileLinkSectionModel(model)
      next(null, {
        html: html,
        model: model.item
      })
    }
  }
}

function notifyAccepted (submission, done) {
  if (submission.email === ownerEmail) {
    (done || noop)(null); return
  }
  const tasks = {
    owners: findOwners,
    preview: compilePreview(submission),
    invoice: generateInvoice
  }
  contra.concurrent(tasks, prepareModel)

  function generateInvoice (next) {
    if (!submission.invoice) {
      next(null); return
    }
    const now = moment.utc()
    const invoiceSlug = sluggish(util.format(`%s-%s-%s`,
      submission.email.split(`@`)[0],
      getRandomCode().slice(0, 4),
      now.format(`YYMMDD`)
    ))
    const partyQuery = {
      slug: paymentPartySlug,
      type: `payment`
    }

    InvoiceParty
      .findOne(partyQuery)
      .exec(foundParty)

    function foundParty (err, paymentParty) {
      if (err) {
        next(err); return
      }
      if (!paymentParty) {
        next(new Error(`Payment party not found.`)); return
      }
      const invoiceModel = {
        date: now.toDate(),
        slug: invoiceSlug,
        customer: {
          name: submission.submitter || submission.email,
          details: submission.email
        },
        paymentParty: paymentParty,
        items: [{
          summary: `Pony Foo Weekly ` + invoiceItems[submission.subtype],
          amount: submission.amount,
          rate: invoiceRates[submission.subtype]
        }],
        paid: false
      }
      new Invoice(invoiceModel).save(saved)
    }

    function saved (err, invoice) {
      if (err) {
        next(err); return
      }
      const invoiceModel = invoiceModelService.generateModel(invoice)
      const viewModel = {
        leanLayout: true,
        model: {
          title: `Invoice #` + invoiceSlug + ` \u2014 Pony Foo`,
          invoice: invoiceModel,
          pdf: true
        }
      }
      viewService.render(`invoices/invoice`, viewModel, rendered)

      function rendered (err, html) {
        if (err) {
          next(err); return
        }
        const filename = invoiceSlug + `.pdf`
        const filepath = path.join(tmpdir, util.format(`%s.%s.pdf`, invoiceSlug, getRandomCode()))
        const options = {
          base: authority,
          border: `20px`,
          width: `1380px`,
          height: `840px`
        }
        pdf.create(html, options).toFile(filepath, generated)
        function generated (err) {
          if (err) {
            next(err); return
          }
          next(null, { name: filename, file: filepath })
        }
      }
    }
  }

  function prepareModel (err, result) {
    if (err) {
      error(err); return
    }
    const everyone = [submission.email].concat(result.owners.map(toEmail))
    const attachments = result.invoice ? [result.invoice] : []
    const type = submissionTypes[submission.subtype]
    const titleSummary = summaryService.summarize(result.preview.model.titleHtml, maxTitleLength)
    const titleText = titleSummary.text
    const model = {
      to: submission.email,
      cc: everyone,
      subject: util.format(`“%s” was accepted into Pony Foo Weekly! 🎉`, titleText),
      teaserHtml: util.format(`Your %s will be included in future newsletters.`, type),
      css: css,
      attachments: attachments,
      submission: {
        subtype: submission.subtype,
        subtypeText: type,
        submitter: submission.submitter,
        titleText: titleText,
        previewHtml: result.preview.html,
        invoice: submission.invoice
      }
    }
    emailService.send(`newsletter-submission-accepted`, model, done)
  }

  function error (err) {
    (done || logger)(err)
  }
}

function notifyReceived (submission, done) {
  if (submission.email === ownerEmail) {
    (done || noop)(null); return
  }
  const tasks = {
    owners: findOwners,
    preview: compilePreview(submission),
    gravatar: fetchGravatar
  }
  contra.concurrent(tasks, prepareModel)

  function fetchGravatar (next) {
    gravatarService.fetch(submission.email, fetched)
    function fetched (err, gravatar) {
      if (err) {
        next(err); return
      }
      gravatar.name = `gravatar`
      next(null, gravatar)
    }
  }

  function prepareModel (err, result) {
    if (err) {
      error(err); return
    }
    const verify = getToken(submission)
    const permalink = util.format(`/weekly/submissions/%s/edit?verify=%s`, submission.slug, verify)
    const everyone = [submission.email].concat(result.owners.map(toEmail))
    const titleSummary = summaryService.summarize(result.preview.model.titleHtml, maxTitleLength)
    const titleText = titleSummary.text
    const model = {
      to: submission.email,
      cc: everyone,
      subject: util.format(`We got your “%s” submission for Pony Foo Weekly! 🎉`, titleText),
      teaserHtml: util.format(`Here’s a link to <a href="%s">review your submission</a>.`, authority + permalink),
      teaserRight: `We’ll be in touch soon!`,
      css: css,
      permalink: permalink,
      images: submission.commentHtml ? [result.gravatar] : [],
      submission: {
        subtype: submission.subtype,
        subtypeText: submissionTypes[submission.subtype],
        submitter: submission.submitter,
        commentHtml: submission.commentHtml,
        previewHtml: result.preview.html
      },
      linkedData: {
        '@context': `http://schema.org`,
        '@type': `EmailMessage`,
        potentialAction: {
          '@type': `ViewAction`,
          name: `Review Submission`,
          target: authority + permalink
        },
        description: `Review Submission – Pony Foo`
      }
    }
    emailService.send(`newsletter-submission-ack`, model, done)
  }

  function error (err) {
    (done || logger)(err)
  }
}

function toEmail (user) {
  return user.email
}

function logger (err) {
  const description = `Uncaught exception while sending email about weekly submission.`
  const data = { stack: err.stack || err.message || err || `(unknown)` }
  winston.error(description, data)
}

function getRandomCode () {
  return Math.random().toString(18).substr(2)
}

function wasEverAccepted (submission) {
  const { status } = submission
  return submission.accepted || status === `accepted` || status === `used`
}

function toSubmissionModel (submission) {
  const id = submission._id.toString()
  const section = assign({}, submission.section, {
    titleHtml: markupService.compile(submission.section.title)
  })
  return { id, section }
}

module.exports = {
  isEditable,
  wasEverAccepted,
  getToken,
  notifyReceived,
  notifyAccepted,
  toSubmissionModel
}
