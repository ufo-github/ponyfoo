'use strict';

const winston = require('winston');
const sluggish = require('sluggish');
const Invoice = require('../../../models/Invoice');

module.exports = function (req, res) {
  const body = req.body.invoice;
  const model = {};
  model.date = body.date;
  model.slug = sluggish(body.slug);
  model.customer = {
    name: body.customer.name,
    details: body.customer.details
  };
  model.payment = {
    name: body.payment.name,
    details: body.payment.details
  };
  model.items = body.items;
  model.paid = body.paid;
  new Invoice(model).save(saved);
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/invoices/new');
    } else {
      res.redirect('/invoices');
    }
  }
};
