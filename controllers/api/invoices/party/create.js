'use strict';

var winston = require('winston');
var sluggish = require('sluggish');
var InvoiceParty = require('../../../../models/InvoiceParty');
var invoicePartyTypes = ['customer', 'payment'];

module.exports = function (req, res) {
  var body = req.body;
  var invalidType = invoicePartyTypes.indexOf(body.type) === -1;
  var type = invalidType ? 'customer' : body.type;
  var model = {
    title: body.title,
    slug: sluggish(body.slug),
    type: type,
    name: body.name,
    details: body.details.split('\n')
  };
  new InvoiceParty(model).save(saved);
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/invoices/parties/new');
    } else {
      res.redirect('/invoices/parties');
    }
  }
};
