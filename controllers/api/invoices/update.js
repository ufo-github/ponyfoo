'use strict'

const winston = require(`winston`)
const sluggish = require(`sluggish`)
const Invoice = require(`../../../models/Invoice`)

module.exports = function (req, res, next) {
  const slug = req.params.slug
  const body = req.body.invoice
  const query = { slug: slug }
  Invoice.findOne(query, found)
  function found (err, invoice) {
    if (err) {
      next(err); return
    }
    if (!invoice) {
      next(`route`); return
    }
    invoice.date = body.date
    invoice.slug = sluggish(body.slug)
    invoice.customer = {
      name: body.customer.name,
      details: body.customer.details
    }
    invoice.payment = {
      name: body.payment.name,
      details: body.payment.details
    }
    invoice.items = body.items
    invoice.paid = body.paid
    invoice.save(saved)
  }
  function saved (err) {
    if (err) {
      winston.error(err)
      res.redirect(`/invoices/` + slug + `/edit`)
    } else {
      res.redirect(`/invoices`)
    }
  }
}
