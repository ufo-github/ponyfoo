'use strict'

require(`../preconfigure`)
require(`../chdir`)

const opn = require(`opn`)
const path = require(`path`)
const util = require(`util`)
const winston = require(`winston`)
const moment = require(`moment`)
const sluggish = require(`sluggish`)
const pdf = require(`html-pdf`)
const db = require(`../lib/db`)
const env = require(`../lib/env`)
const boot = require(`../lib/boot`)
const Invoice = require(`../models/Invoice`)
const invoiceModelService = require(`../services/invoiceModel`)
const viewService = require(`../services/view`)
const authority = env(`AUTHORITY`)
const tmpdir = path.join(process.cwd(), `tmp`)

boot(booted)

function booted () {
  Invoice.findOne({}, found)

  function found (err, invoice) {
    if (err) {
      errored(err); return
    }

    const now = moment.utc()
    const invoiceSlug = sluggish(util.format(`%s-%s-%s`,
      `example`,
      getRandomCode().slice(0, 4),
      now.format(`YYMMDD`)
    ))
    const invoiceModel = invoiceModelService.generateModel(invoice)
    const viewModel = {
      leanLayout: true,
      model: {
        title: `Invoice #` + invoiceSlug + ` \u2014 Pony Foo`,
        invoice: invoiceModel,
        pdf: true
      }
    }
    const filepath = path.join(tmpdir, util.format(`%s.%s.pdf`, invoiceSlug, getRandomCode()))

    invoiceModel.paid = false
    viewService.render(`invoices/invoice`, viewModel, rendered)

    function rendered (err, html) {
      if (err) {
        errored(err); return
      }
      const options = {
        base: authority,
        border: `20px`,
        width: `1380px`,
        height: `840px`
      }
      winston.info(`Generating invoice PDF...`)
      pdf.create(html, options).toFile(filepath, generated)
    }

    function generated (err) {
      if (err) {
        errored(err); return
      }
      winston.info(`Opening invoice PDF.`)
      opn(filepath).then(end).catch(errored)
    }
  }
}

function getRandomCode () {
  return Math.random().toString(18).substr(2)
}

function end () {
  db.disconnect(() => process.exit(0))
}

function errored (err) {
  winston.error(err)
  process.exit(1)
}
