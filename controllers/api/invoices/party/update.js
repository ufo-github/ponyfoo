'use strict'

const winston = require(`winston`)
const sluggish = require(`sluggish`)
const InvoiceParty = require(`../../../../models/InvoiceParty`)
const invoicePartyTypes = [`customer`, `payment`]

module.exports = function (req, res, next) {
  const slug = req.params.slug
  InvoiceParty.findOne({ slug: slug }).exec(found)
  function found (err, invoiceParty) {
    if (err) {
      next(err); return
    }
    if (!invoiceParty) {
      next(`route`); return
    }
    const body = req.body
    const invalidType = invoicePartyTypes.indexOf(body.type) === -1
    const type = invalidType ? `customer` : body.type
    invoiceParty.title = body.title
    invoiceParty.slug = sluggish(body.slug)
    invoiceParty.type = type
    invoiceParty.name = body.name
    invoiceParty.details = body.details
    invoiceParty.save(saved)
    function saved (err) {
      if (err) {
        winston.error(err)
        res.redirect(`/invoices/parties/` + slug + `/edit`)
      } else {
        res.redirect(`/invoices/parties`)
      }
    }
  }
}
