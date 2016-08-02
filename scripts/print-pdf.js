'use strict';

require('../preconfigure');
require('../chdir');

var opn = require('opn');
var path = require('path');
var util = require('util');
var winston = require('winston');
var moment = require('moment');
var sluggish = require('sluggish');
var pdf = require('html-pdf');
var db = require('../lib/db');
var env = require('../lib/env');
var boot = require('../lib/boot');
var Invoice = require('../models/Invoice');
var invoiceModelService = require('../services/invoiceModel');
var viewService = require('../services/view');
var authority = env('AUTHORITY');
var tmpdir = path.join(process.cwd(), 'tmp');

boot(booted);

function booted () {
  Invoice.findOne({}, found);

  function found (err, invoice) {
    if (err) {
      errored(err); return;
    }

    var now = moment.utc();
    var invoiceSlug = sluggish(util.format('%s-%s-%s',
      'example',
      getRandomCode().slice(0, 4),
      now.format('YYMMDD')
    ));
    var invoiceModel = invoiceModelService.generateModel(invoice);
    var viewModel = {
      leanLayout: true,
      model: {
        title: 'Invoice #' + invoiceSlug + ' \u2014 Pony Foo',
        invoice: invoiceModel,
        pdf: true
      }
    };
    var filename = invoiceSlug + '.pdf';
    var filepath = path.join(tmpdir, util.format('%s.%s.pdf', invoiceSlug, getRandomCode()));

    invoiceModel.paid = false;
    viewService.render('invoices/invoice', viewModel, rendered);

    function rendered (err, html) {
      if (err) {
        errored(err); return;
      }
      var options = {
        base: authority,
        border: '20px',
        width: '1380px',
        height: '840px'
      };
      winston.info('Generating invoice PDF...');
      pdf.create(html, options).toFile(filepath, generated);
    }

    function generated (err) {
      if (err) {
        errored(err); return;
      }
      winston.info('Opening invoice PDF.');
      opn(filepath).then(end).catch(errored);
    }
  }
}

function getRandomCode () {
  return Math.random().toString(18).substr(2);
}

function end () {
  db.disconnect(() => process.exit(0));
}

function errored (err) {
  winston.error(err);
  process.exit(1);
}
