'use strict';

const winston = require(`winston`);
const Invoice = require(`../../../models/Invoice`);

module.exports = function (req, res) {
  Invoice.remove({ slug: req.params.slug }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
    }
    res.redirect(`/invoices`);
  }
};
