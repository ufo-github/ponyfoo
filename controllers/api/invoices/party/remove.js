'use strict';

const winston = require('winston');
const InvoiceParty = require('../../../../models/InvoiceParty');

module.exports = function (req, res) {
  InvoiceParty.remove({ slug: req.params.slug }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
    }
    res.redirect('/invoices/parties');
  }
};
