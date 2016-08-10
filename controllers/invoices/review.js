'use strict';

const Invoice = require('../../models/Invoice');
const invoiceModelService = require('../../services/invoiceModel');

module.exports = function (req, res, next) {
  Invoice.find({}).sort('-date').lean().exec(function (err, invoices) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Invoices \u2014 Pony Foo',
        meta: {
          canonical: '/invoices'
        },
        invoices: invoices.map(invoiceModelService.generateModel)
      }
    };
    next();
  });
};
