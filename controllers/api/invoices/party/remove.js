'use strict';

var winston = require('winston');
var InvoiceParty = require('../../../../models/InvoiceParty');

module.exports = function (req, res) {
  InvoiceParty.remove({ slug: req.params.slug }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
    }
    res.redirect('/invoices/parties');
  }
};
