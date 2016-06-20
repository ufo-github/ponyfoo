'use strict';

var InvoiceParty = require('../../../models/InvoiceParty');
var datetimeService = require('../../../services/datetime');

module.exports = function (req, res, next) {
  InvoiceParty.find({}).sort('-created').lean().exec(found);
  function found (err, invoiceParties) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Invoice Parties \u2014 Pony Foo',
        meta: {
          canonical: '/invoices/parties'
        },
        invoiceParties: invoiceParties.map(augmentParty)
      }
    };
    next();
  }
};

function augmentParty (party) {
  party.created = datetimeService.field(party.created);
  return party;
}
