'use strict';

var moment = require('moment');
var Invoice = require('../../models/Invoice');
var InvoiceParty = require('../../models/InvoiceParty');
var invoiceModelService = require('../../services/invoiceModel');

module.exports = function (req, res, next) {
  InvoiceParty.find({}).lean().exec(foundParties);

  function foundParties (err, allParties) {
    if (err) {
      next(err); return;
    }
    var parties = allParties.reduce(partiesIntoBuckets, {
      customer: [], payment: []
    });
    var slug = req.params.slug;
    if (slug) {
      Invoice.findOne({ slug: slug }).lean().exec(found);
    } else {
      respond(defaultInvoice());
    }

    function partiesIntoBuckets (buckets, party) {
      if (buckets[party.type]) {
        buckets[party.type].push(party);
      } else {
        buckets[party.type] = [party];
      }
      return buckets;
    }

    function found (err, invoice) {
      if (err) {
        next(err); return;
      }
      if (!invoice) {
        next('route'); return;
      }
      respond(invoice);
    }

    function respond (invoice) {
      var title = slug ? 'Invoice #' + slug : 'New Invoice';
      var canonical = slug ? '/' + slug + '/edit' : '/new';
      res.viewModel = {
        model: {
          title: title + ' \u2014 Pony Foo',
          meta: {
            canonical: '/invoices' + canonical
          },
          invoice: invoiceModelService.generateModel(invoice),
          editing: !!slug,
          parties: parties
        }
      };
      next();
    }

    function defaultInvoice () {
      return {
        date: moment().toDate(),
        customer: parties.customer[0],
        payment: parties.payment[0],
        items: []
      };
    }
  }
}
