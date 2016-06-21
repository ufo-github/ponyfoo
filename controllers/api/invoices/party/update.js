'use strict';

var winston = require('winston');
var sluggish = require('sluggish');
var InvoiceParty = require('../../../../models/InvoiceParty');
var invoicePartyTypes = ['customer', 'payment'];

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  InvoiceParty.findOne({ slug: slug }).exec(found);
  function found (err, invoiceParty) {
    if (err) {
      next(err); return;
    }
    if (!invoiceParty) {
      next('route'); return;
    }
    var body = req.body;
    var invalidType = invoicePartyTypes.indexOf(body.type) === -1;
    var type = invalidType ? 'customer' : body.type;
    invoiceParty.title = body.title;
    invoiceParty.slug = sluggish(body.slug);
    invoiceParty.type = type;
    invoiceParty.name = body.name;
    invoiceParty.details = body.details;
    invoiceParty.save(saved);
    function saved (err) {
      if (err) {
        winston.error(err);
        res.redirect('/invoices/parties/' + slug + '/edit');
      } else {
        res.redirect('/invoices/parties');
      }
    }
  }
};
