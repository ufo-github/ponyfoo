'use strict';

const winston = require(`winston`);
const sluggish = require(`sluggish`);
const InvoiceParty = require(`../../../../models/InvoiceParty`);
const invoicePartyTypes = [`customer`, `payment`];

module.exports = function (req, res) {
  const body = req.body;
  const invalidType = invoicePartyTypes.indexOf(body.type) === -1;
  const type = invalidType ? `customer` : body.type;
  const model = {
    title: body.title,
    slug: sluggish(body.slug),
    type: type,
    name: body.name,
    details: body.details
  };
  new InvoiceParty(model).save(saved);
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect(`/invoices/parties/new`);
    } else {
      res.redirect(`/invoices/parties`);
    }
  }
};
