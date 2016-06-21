'use strict';

var winston = require('winston');
var sluggish = require('sluggish');
var Invoice = require('../../../models/Invoice');

module.exports = function (req, res) {
  var body = req.body.invoice;
  var model = {};
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
