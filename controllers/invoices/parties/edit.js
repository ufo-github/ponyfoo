'use strict';

var InvoiceParty = require('../../../models/InvoiceParty');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  if (slug) {
    InvoiceParty.findOne({ slug: slug }).lean().exec(found);
  } else {
    respond(defaultInvoiceParty());
  }

  function found (err, invoiceParty) {
    if (err) {
      next(err); return;
    }
    if (!invoiceParty) {
      next('route'); return;
    }
    respond(invoiceParty);
  }

  function respond (invoiceParty) {
    var title = slug ? 'Invoice Party #' + slug : 'New Invoice Party';
    var canonical = slug ? '/' + slug + '/edit' : '/new';
    res.viewModel = {
      model: {
        title: title + ' \u2014 Pony Foo',
        meta: {
          canonical: '/invoices/parties' + canonical
        },
        invoiceParty: invoiceParty,
        editing: !!slug
      }
    };
    next();
  }

  function defaultInvoiceParty () {
    return {
      type: 'customer',
      title: '',
      slug: '',
      name: '',
      details: []
    };
  }
};
